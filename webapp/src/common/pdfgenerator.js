import QRCode from  'qrcode';
import {ReasonsEnum} from "./reasonsenum.js";
const Version = "2020 - c35428a"
import { default as PDF } from 'pdf-lib'
var PDFDocument;
var StandardFonts;
// todo improve those messy imports
if (PDF === undefined) { //webpack babel
    import('pdf-lib').then((P) => {
        PDFDocument = P.PDFDocument;
        StandardFonts = P.StandardFonts;
    });
} else { //nodejs
    PDFDocument = PDF.PDFDocument;
    StandardFonts = PDF.StandardFonts;
}

const ReasonsToGoOutInfo = [
    {key: ReasonsEnum.work, draw:'x', x: 76, y: 527, size: 19},
    {key: ReasonsEnum.grocery, draw:'x', x: 76, y: 478, size: 19},
    {key: ReasonsEnum.health, draw:'x', x: 76, y: 436, size: 19},
    {key: ReasonsEnum.family, draw:'x', x: 76, y: 400, size: 19},
    {key: ReasonsEnum.sport, draw:'x', x: 76, y: 345, size: 19},
    {key: ReasonsEnum.legal, draw:'x', x: 76, y: 298, size: 19},
    {key: ReasonsEnum.missions, draw:'x', x: 76, y: 260, size: 19}
]

const generateQR = async text => {
    try {
        const opts = {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
        }
        return await QRCode.toDataURL(text, opts)
    } catch (err) {
        throw err
    }
}

function idealFontSize(font, text, maxWidth, minSize, defaultSize) {
    let currentSize = defaultSize
    let textWidth = font.widthOfTextAtSize(text, defaultSize)

    while (textWidth > maxWidth && currentSize > minSize) {
        textWidth = font.widthOfTextAtSize(text, --currentSize)
    }

    return (textWidth > maxWidth) ? null : currentSize
}

async function generatePdf(profile, basePdf) {
    const data = [
        `Cree le: ${profile.getFormattedDateRelease()} a ${profile.getFormattedHourRelease()}`,
        `Nom: ${profile.lastName}`,
        `Prenom: ${profile.firstName}`,
        `Naissance: ${profile.getFormattedBirthday()} a ${profile.birthplace}`,
        `Adresse: ${profile.address} ${profile.zipcode} ${profile.town}`,
        `Sortie: ${profile.getFormattedDateOut()} a ${profile.getFormattedHourOut()}`,
        `Motifs: ${profile.reasons.join('-')}`,
    ].join('; ')
    const pdfDoc = await PDFDocument.load(basePdf)
    const page1 = pdfDoc.getPages()[0]

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawText = (text, x, y, size = 11) => {
        page1.drawText(text, {
            x,
            y,
            size,
            font
        })
    }

    drawText(`${profile.firstName} ${profile.lastName}`, 123, 686)
    drawText(profile.getFormattedBirthday(), 123, 661)
    drawText(profile.birthplace, 92, 638)
    drawText(`${profile.address} ${profile.zipcode} ${profile.town}`, 134, 613)

    profile.reasons.forEach(reason => {
        const infos = ReasonsToGoOutInfo.find(r => r.key === reason);
        drawText(infos.draw, infos.x, infos.y, infos.size)
    });

    let locationSize = idealFontSize(font, profile.town, 83, 7, 11)

    if (!locationSize) {
        //Warning
        console.log('Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
            'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.')
        locationSize = 7
    }

    drawText(profile.town, 111, 226, locationSize)

    drawText(profile.getFormattedDateOut(), 92, 200)
    drawText(profile.getFormattedHoursOut(), 200, 201)
    drawText(profile.getFormattedMinutesOut(), 220, 201)

    drawText('Date de création:', 464, 150, 7)
    drawText(`${profile.getFormattedDateRelease()} à ${profile.getFormattedHourRelease()}`, 455, 144, 7)

    const generatedQR = await generateQR(data)
    const qrImage = await pdfDoc.embedPng(generatedQR)

    page1.drawImage(qrImage, {
        x: page1.getWidth() - 170,
        y: 155,
        width: 100,
        height: 100,
    })

    pdfDoc.addPage()
    const page2 = pdfDoc.getPages()[1]
    page2.drawImage(qrImage, {
        x: 50,
        y: page2.getHeight() - 350,
        width: 300,
        height: 300,
    })

    return await pdfDoc.save()
}

export default {
    generatePdf,
}

export {
    generatePdf,
    Version
}
