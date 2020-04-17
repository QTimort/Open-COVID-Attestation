import {appendFile, readFileSync} from 'fs';
import {ProfileData} from '../webapp/src/common/profiledata.js'
import {ReasonsEnum} from '../webapp/src/common/reasonsenum.js'
import {generatePdf} from '../webapp/src/common/pdfgenerator.js'

const PdfBasePath = "../common/res/certificate.pdf";
const OutFileName = 'attestation.pdf';
const profile = new ProfileData();

profile.reasons = [ReasonsEnum.family];

(async () => {
    const existingPdfBytes = readFileSync(PdfBasePath);
    const pdfBytes = await generatePdf(profile, existingPdfBytes);
    await appendFile(OutFileName, pdfBytes, { encoding: 'utf8', mode: 0o666, flag: 'w+' }, function (err) {
        if (err) {
            console.error("Is the file already open / in use?")
            throw err;
        }
        console.log(`Attestation saved to ${OutFileName}!`);
    });
})()
