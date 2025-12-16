import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export const generateTicketPDF = async (order, event) => {
    // Create a temporary container for the ticket
    const ticketContainer = document.createElement('div');
    ticketContainer.style.position = 'absolute';
    ticketContainer.style.left = '-9999px';
    ticketContainer.style.width = '800px';
    ticketContainer.style.background = '#0f172a';
    ticketContainer.style.padding = '40px';
    ticketContainer.style.fontFamily = 'Arial, sans-serif';

    ticketContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; overflow: hidden; border: 2px solid #334155;">
            <!-- Header with Event Image -->
            <div style="position: relative; height: 250px; overflow: hidden;">
                <img src="${event.image}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent); padding: 30px;">
                    <h1 style="color: #fff; font-size: 32px; margin: 0; font-weight: bold;">${event.title}</h1>
                </div>
            </div>
            
            <!-- Ticket Body -->
            <div style="padding: 40px; background: #1e293b;">
                <!-- Event Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">📅 DATE</div>
                        <div style="color: #fff; font-size: 18px; font-weight: bold;">
                            ${new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
                        </div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">⏰ HEURE</div>
                        <div style="color: #fff; font-size: 18px; font-weight: bold;">${event.time}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">📍 LIEU</div>
                        <div style="color: #fff; font-size: 18px; font-weight: bold;">${event.venue}</div>
                    </div>
                    <div>
                        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">🏙️ VILLE</div>
                        <div style="color: #fff; font-size: 18px; font-weight: bold;">${event.city}</div>
                    </div>
                </div>
                
                <!-- Separator -->
                <div style="height: 2px; background: linear-gradient(to right, #a855f7, #ec4899); margin: 30px 0;"></div>
                
                <!-- Customer Info -->
                <div style="margin-bottom: 30px;">
                    <div style="color: #a855f7; font-size: 16px; font-weight: bold; margin-bottom: 15px;">INFORMATIONS CLIENT</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <div style="color: #94a3b8; font-size: 14px; margin-bottom: 5px;">Nom</div>
                            <div style="color: #fff; font-size: 16px;">${order.customerName}</div>
                        </div>
                        <div>
                            <div style="color: #94a3b8; font-size: 14px; margin-bottom: 5px;">Téléphone</div>
                            <div style="color: #fff; font-size: 16px;">${order.customerPhone}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tickets -->
                <div style="margin-bottom: 30px;">
                    <div style="color: #a855f7; font-size: 16px; font-weight: bold; margin-bottom: 15px;">BILLETS</div>
                    <div style="background: #0f172a; border-radius: 10px; padding: 20px;">
                        ${order.tickets.map(ticket => `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155;">
                                <span style="color: #fff;">${ticket.quantity}x ${ticket.type}</span>
                                <span style="color: #a855f7; font-weight: bold;">${(ticket.price * ticket.quantity).toLocaleString()} CDF</span>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px;">
                            <span style="color: #fff; font-weight: bold; font-size: 18px;">TOTAL</span>
                            <span style="color: #a855f7; font-weight: bold; font-size: 20px;">${order.totalAmount.toLocaleString()} CDF</span>
                        </div>
                    </div>
                </div>
                
                <!-- QR Code and Token -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; border-radius: 10px; padding: 20px;">
                    <div>
                        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">TOKEN DE VALIDATION</div>
                        <div style="color: #22c55e; font-size: 24px; font-weight: bold; font-family: monospace;">${order.token}</div>
                        <div style="color: #94a3b8; font-size: 12px; margin-top: 8px;">ID: ${order._id.slice(-8)}</div>
                    </div>
                    <div id="qr-code-container" style="background: white; padding: 10px; border-radius: 10px;">
                        <!-- QR Code will be inserted here -->
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155;">
                    <div style="color: #94a3b8; font-size: 14px;">
                        Présentez ce billet à l'entrée • Evan Lesnar
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(ticketContainer);

    // Generate QR code using qrcode library
    const qrContainer = ticketContainer.querySelector('#qr-code-container');
    const qrCanvas = document.createElement('canvas');

    await QRCode.toCanvas(qrCanvas, order._id, {
        width: 120,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    qrContainer.appendChild(qrCanvas);

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert to canvas
    const canvas = await html2canvas(ticketContainer, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true
    });

    // Create PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Clean up
    document.body.removeChild(ticketContainer);

    // Download
    pdf.save(`Billet-${event.title.replace(/\s+/g, '-')}-${order.token}.pdf`);
};
