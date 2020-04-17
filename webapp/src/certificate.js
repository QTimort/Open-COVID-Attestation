import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import {French} from "flatpickr/dist/l10n/fr.js"
import {Base64BasePdf} from "./base64pdf";
import {generatePdf} from "./common/pdfgenerator";
import {ProfileData} from "./common/profiledata";
import {ReasonsEnum} from "./common/reasonsenum";

const streetInput = document.getElementById('street-input');
const cityInput = document.getElementById('city-input');
const postCodeInput = document.getElementById('postcode-input');
const firstNameInput = document.getElementById('firstname-input');
const lastNameInput = document.getElementById('lastname-input');
const birthdayInput = document.getElementById('birthday-input');
const birthPlaceInput = document.getElementById('birthplace-input');
const dateOutInput = document.getElementById('dateout-input');
const dateReleaseInput = document.getElementById('daterelease-input');
// reasons
const workInput = document.getElementById('work-input');
const groceryInput = document.getElementById('grocery-input');
const healthInput = document.getElementById('health-input');
const familyInput = document.getElementById('family-input');
const sportInput = document.getElementById('sport-input');
const legalInput = document.getElementById('legal-input');
const missionsInput = document.getElementById('missions-input');

async function generateAttestation(profile) {
    const pdfBytes = await generatePdf(profile, 'data:application/pdf;base64,' + Base64BasePdf);
    return new Blob([pdfBytes], {type: 'application/pdf'});
}

function downloadBlob(blob, fileName) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
}

function geoFindMe() {
    const status = document.querySelector('#status');
    const mapLink = document.querySelector('#map-link');

    mapLink.href = '';
    mapLink.textContent = '';

    function success(position) {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        //const latitude  = 48.8704;
        //const longitude = 2.3168;
        status.textContent = '';
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

        fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&type=housenumber&limit=15`)
                    .then((e) => e.json(), (e) => {alert('error: '+ e);})
                    .then((e) => {
                        console.log(e.features);
                        const address = e.features[0].properties;
                        if (address.distance > 1000) {
                            alert("Too far!");
                        }
                        if (address.scope < 0.95) {
                            alert("Low address score!");
                        }
                        streetInput.value = address.name;
                        cityInput.value = address.city;
                        postCodeInput.value = address.postcode;
                    })
    }

    function error() {
        switch (error.code) {
            case error.TIMEOUT:
                alert("Browser geolocation error !\n\nTimeout.");
                break;
            case error.PERMISSION_DENIED:
                alert(`Browser geolocation error !\n\nPermission error (${error.message}).`);
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Browser geolocation error !\n\nPosition unavailable.");
                break;
        }
        status.textContent = 'Unable to retrieve your location';
    }

    if (!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser';
    } else {
        status.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true, maximumAge: 10000, timeout: 20000});
    }
}

flatpickr(".date", {locale: French});
flatpickr(".datetime", {enableTime: true, locale: French});

document.querySelector('#find-me').addEventListener('click', geoFindMe);

document.getElementById('generate-pdf').onmouseup = async (e) => {
    const p = new ProfileData();

    p.zipcode = postCodeInput.value;
    p.address = streetInput.value;
    p.town = cityInput.value;

    p.firstName = firstNameInput.value;
    p.lastName = lastNameInput.value;
    p.birthday = birthdayInput.value;
    p.birthplace = birthPlaceInput.value;

    p.dateOut = dateOutInput.value;
    p.dateRelease = dateReleaseInput.value;

    if (workInput.checked) p.reasons.push(ReasonsEnum.work);
    if (groceryInput.checked) p.reasons.push(ReasonsEnum.grocery);
    if (healthInput.checked) p.reasons.push(ReasonsEnum.health);
    if (familyInput.checked) p.reasons.push(ReasonsEnum.family);
    if (sportInput.checked) p.reasons.push(ReasonsEnum.sport);
    if (legalInput.checked) p.reasons.push(ReasonsEnum.legal);
    if (missionsInput.checked) p.reasons.push(ReasonsEnum.missions);

    await downloadBlob(await generateAttestation(p), "attestation.pdf");
}
