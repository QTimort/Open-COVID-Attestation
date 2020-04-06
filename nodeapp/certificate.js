const PDFLib = require('pdf-lib')
const PDFDocument =  PDFLib.PDFDocument;
const StandardFonts =  PDFLib.StandardFonts;
const QRCode =  require('qrcode');
const DateFormat = require('dateformat');
const FS = require('fs');
const PdfBasePath = "../common/res/certificate.pdf";
const Version = "2020 - c35428a"

const ReasonsEnum = Object.freeze({
    work: 0,
    grocery: 1,
    health: 2,
    family: 3,
    sport: 4,
    legal: 5,
    missions: 6,
})

const ReasonsToGoOutInfo = [
    {key: ReasonsEnum.work, draw:'x', x: 76, y: 527, size: 19},
    {key: ReasonsEnum.grocery, draw:'x', x: 76, y: 478, size: 19},
    {key: ReasonsEnum.health, draw:'x', x: 76, y: 436, size: 19},
    {key: ReasonsEnum.family, draw:'x', x: 76, y: 400, size: 19},
    {key: ReasonsEnum.sport, draw:'x', x: 76, y: 345, size: 19},
    {key: ReasonsEnum.legal, draw:'x', x: 76, y: 298, size: 19},
    {key: ReasonsEnum.missions, draw:'x', x: 76, y: 260, size: 19}
]

class ProfileData {
    constructor(
        lastName = "Macro",
        firstName = "Manu",
        birthday = "21/12/1977",
        birthplace = "Amiens",
        address = "Palais de l'Élysée, Paris 8e",
        zipcode = "75008",
        town = "Paris",
        dateOut = new Date(),
        dateRelease = new Date(),
        reasons = []
    ) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.birthday = birthday;
        this.birthplace = birthplace;
        this.address = address;
        this.zipcode = zipcode;
        this.town = town;
        this.dateOut = dateOut;
        this.dateRelease = dateRelease;
        this.reasons = reasons;
    }

    getFormattedDateRelease() {
        return DateFormat(this.dateRelease, "dd/mm/yyyy");
    }

    getFormattedHourRelease() {
        return DateFormat(this.dateRelease, "HH:MM");
    }

    getFormattedDateOut() {
        return DateFormat(this.dateOut, "dd/mm/yyyy");
    }

    getFormattedHourOut() {
        return DateFormat(this.dateOut, "HH:MM");
    }

    getFormattedHoursOut() {
        return DateFormat(this.dateOut, "HH");
    }

    getFormattedMinutesOut() {
        return DateFormat(this.dateOut, "MM");
    }
}

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

async function generatePdf(profile) {
    const data = [
        `Cree le: ${profile.getFormattedDateRelease()} a ${profile.getFormattedHourRelease()}`,
        `Nom: ${profile.lastName}`,
        `Prenom: ${profile.firstName}`,
        `Naissance: ${profile.birthday} a ${profile.birthplace}`,
        `Adresse: ${profile.address} ${profile.zipcode} ${profile.town}`,
        `Sortie: ${profile.getFormattedDateOut()} a ${profile.getFormattedHourOut()}`,
        `Motifs: ${profile.reasons}`,
    ].join('; ')
    const existingPdfBytes = FS.readFileSync(PdfBasePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
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
    drawText(profile.birthday, 123, 661)
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

module.exports = {
    generatePdf,
    ProfileData,
    ReasonsEnum
}
