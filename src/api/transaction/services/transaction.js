'use strict';

/**
 * transaction service
 */
const QRCode = require('qrcode');
const sharp = require('sharp');

const generateQRCode = async text => {
    try {
      const qrCode = await QRCode.toDataURL(text);
      return qrCode;
    } catch (err) {
      console.error(err);
    }
  };

  const overlayQRCodeOnImage = async (imagePath, code) => {
    const qrCodeData = await generateQRCode(code);
    try {
      // Cargar la imagen original
      let image = sharp(imagePath);
  
      // Obtener las dimensiones de la imagen original
      const metadata = await image.metadata();
  
      // Calcular la posición del código QR (esquina derecha con un poco de margen)
      const qrCodeSize = 500; // Tamaño del QR
      const qrCodePosition = {
        top: (metadata.height - qrCodeSize) / 2,
        left: -200,
      };
      const qrCodeBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
      const resizedQRCode = await sharp(qrCodeBuffer).resize(qrCodeSize, qrCodeSize).toBuffer();

      // Superponer el código QR en la imagen original
      image = await image.composite([{
        input: resizedQRCode,
        top: qrCodePosition.top,
        left: 1400,
      }]);    

      const outputBuffer = await image.toBuffer();

      // Convertir el buffer a una cadena base64
      const base64Image = outputBuffer.toString('base64');
    return base64Image
    } catch (err) {
      console.error(err);
    }
  };

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transaction.transaction', ({ strapi }) =>  ({
    // Method 1: Creating an entirely new custom service
    async sendEmailWithTicket(email, code) {


        const decodedQRCode = await overlayQRCodeOnImage(strapi.dirs.static.public+'/template-ticket.jpeg', code);        
        await strapi.plugins['email'].services.email.send({
            to: email,
            subject: 'Tu ticket',
            text: `Aquí está tu código QR: ${code}`,
            attachment: [{content: decodedQRCode, name: 'ticket.png' }]
        });
          
    },
    // Method 2: Wrapping a core service (leaves core logic in place)
  }));
  
  
  