const FS = require('fs');
const Certificate = require('./certificate');
const OutFileName = 'attestation.pdf';

const profile = new Certificate.ProfileData();
profile.reasons = [Certificate.ReasonsEnum.family];

(async () => {
    const pdfBytes = await Certificate.generatePdf(profile);
    await FS.appendFile(OutFileName, pdfBytes, { encoding: 'utf8', mode: 0o666, flag: 'w+' }, function (err) {
        if (err) {
            console.error("Is the file already open / in use?")
            throw err;
        }
        console.log(`Attestation saved to ${OutFileName}!`);
    });
})()
