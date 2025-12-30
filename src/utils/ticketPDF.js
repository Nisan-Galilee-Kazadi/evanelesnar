import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export const generateTicketPDF = async (order, event) => {
    // Create a temporary container for the ticket
    const ticketContainer = document.createElement('div');
    ticketContainer.style.position = 'absolute';
    ticketContainer.style.left = '-9999px';
    // Flyer dimensions (landscape)
    ticketContainer.style.width = '800px';
    ticketContainer.style.height = '350px';
    ticketContainer.style.background = '#000000';
    ticketContainer.style.fontFamily = 'Inter, Arial, sans-serif';

    const icon = {
        calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:6px;"><path d="M7 2v2M17 2v2" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M3 9h18" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="#dc2626" stroke-width="2"/></svg>',
        clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:6px;"><path d="M12 8v5l3 2" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#dc2626" stroke-width="2"/></svg>',
        pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:6px;"><path d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z" stroke="#dc2626" stroke-width="2"/><path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#dc2626" stroke-width="2"/></svg>',
        city: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-2px; margin-right:6px;"><path d="M3 21h18" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M5 21V7l7-4 7 4v14" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/><path d="M9 21v-6h6v6" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/></svg>'
    };

    const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    ticketContainer.innerHTML = `
        <div id="ticket-capture" style="display: flex; width: 800px; height: 350px; background: #09090b; overflow: hidden; border: 1px solid #27272a;">
            
            <!-- LEFT PANEL: VISUAL (45%) -->
            <div style="width: 45%; position: relative; height: 100%; border-right: 2px dashed #3f3f46;">
                <img src="${event.image}" crossOrigin="anonymous" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; display: block;" />
                <div style="position: absolute; inset: 0; background: linear-gradient(to top, #000 10%, transparent 60%);"></div>
                
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 25px;">
                    <h1 style="color: #fff; font-size: 28px; line-height: 1.1; margin: 0 0 15px 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">${event.title}</h1>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center;">
                            ${icon.calendar}
                            <span style="color: #e4e4e7; font-size: 14px; font-weight: 500;">${formattedDate}</span>
                        </div>
                         <div style="display: flex; align-items: center;">
                            ${icon.clock}
                            <span style="color: #e4e4e7; font-size: 14px; font-weight: 500;">${event.time}</span>
                        </div>
                         <div style="display: flex; align-items: center;">
                            ${icon.pin}
                            <span style="color: #e4e4e7; font-size: 14px; font-weight: 500;">${event.venue}, ${event.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT PANEL: DETAILS (55%) -->
            <div style="width: 55%; padding: 25px 30px; display: flex; flex-direction: column; justify-content: space-between; background: #09090b; position: relative;">
                
                <!-- Logo / Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                         <div style="color: #dc2626; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 5px;">BILLET ÉLECTRONIQUE</div>
                         <div style="color: #71717a; font-size: 12px;">Ref: #${order._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #fff; font-size: 16px; font-weight: bold;">${order.customerName}</div>
                        <div style="color: #71717a; font-size: 12px;">${order.customerPhone}</div>
                    </div>
                </div>

                <!-- Ticket Details -->
                <div style="margin-top: 10px;">
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 15px;">
                         ${order.tickets.map(ticket => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                                <span style="color: #e4e4e7; font-weight: 500;">${ticket.quantity}x <span style="color: #fff;">${ticket.type}</span></span>
                                <span style="color: #dc2626; font-weight: 600;">${(ticket.price * ticket.quantity).toLocaleString()} CDF</span>
                            </div>
                        `).join('')}
                        <div style="border-top: 1px dashed #3f3f46; margin: 10px 0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #a1a1aa; font-size: 12px; font-weight: 600;">TOTAL</span>
                            <span style="color: #fff; font-size: 18px; font-weight: 800;">${order.totalAmount.toLocaleString()} <span style="font-size: 12px; color: #dc2626;">CDF</span></span>
                        </div>
                    </div>
                </div>

                <!-- Footer (QR & Token) -->
                <div style="display: flex; gap: 20px; align-items: center; margin-top: auto;">
                    <div id="qr-code-container" style="background: #fff; padding: 5px; border-radius: 6px; flex-shrink: 0;">
                        <!-- QR Code Here -->
                    </div>
                    <div style="flex-grow: 1;">
                         <div style="color: #71717a; font-size: 10px; font-weight: 600; letter-spacing: 1px; margin-bottom: 4px;">TOKEN DE VALIDATION</div>
                         <div style="color: #fff; font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; letter-spacing: 1px; color: #dc2626;">${order.token}</div>
                         <div style="color: #52525b; font-size: 9px; margin-top: 5px; line-height: 1.3;">Présentez ce QR Code ou ce Token à l'entrée. Billet unique non remboursable.</div>
                    </div>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(ticketContainer);

    // Generate QR code
    const qrContainer = ticketContainer.querySelector('#qr-code-container');
    const qrCanvas = document.createElement('canvas');

    await QRCode.toCanvas(qrCanvas, order._id, {
        width: 80,
        margin: 0,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    qrContainer.appendChild(qrCanvas);

    // Convert to canvas
    const targetElement = ticketContainer.querySelector('#ticket-capture');

    // Safety delay for image loading
    await new Promise(resolve => setTimeout(resolve, 1500));

    const canvas = await html2canvas(targetElement, {
        scale: 2, // Good balance for performance/quality
        backgroundColor: '#09090b',
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: 800,
        onclone: (clonedDoc) => {
            // Ensure styles are locked in
            const el = clonedDoc.querySelector('#ticket-capture');
            if (el) {
                el.style.fontFamily = 'Arial, sans-serif';
            }
        }
    });

    // Custom dimensions (flyer style)
    const pdfWidth = 200;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create PDF with custom dimensions matching the ticket
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);

    document.body.removeChild(ticketContainer);
    pdf.save(`Billet-${event.title.replace(/\s+/g, '-')}-${order.token}.pdf`);
};
