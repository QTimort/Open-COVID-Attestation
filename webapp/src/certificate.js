import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';
import DateFormat from 'dateformat';
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

//buttons
const findMeButon = document.getElementById('find-me');
const autoCompleteButon = document.getElementById('auto-complete');
const dateOutButton = document.getElementById('generate-dateout');
const dateReleaseButton = document.getElementById('generate-daterelease');
const saveToLocalCacheButton = document.getElementById('save-to-cache');
const removeFromLocalCacheButton = document.getElementById('remove-from-cache');

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

function geoFindMe(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
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
                        // todo handle error missing
                        const address = e.features[0].properties;
                        if (address.distance > 1000) {
                            alert("Too far!"); // todo move this to html
                        }
                        if (address.scope < 0.95) {
                            alert("Low address score!"); // todo move this to html
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
        navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true, maximumAge: 60000, timeout: 10000});
    }
}

function setupPage(event) {
    flatpickr(".date", {locale: French, altFormat: "d-m-Y", altInput: false, disableMobile: true});
    flatpickr(".datetime", {enableTime: true, locale: French, altFormat: "d-m-Y H:i", altInput: false, disableMobile: true});
    let jsonProfile = window.localStorage.getItem('profile');
    let p;
    exportProfileToInputsPlaceHolder(ProfileData.newWithDefault());
    if (jsonProfile !== undefined && jsonProfile !== null && jsonProfile.length > 0) {
        p = ProfileData.from(JSON.parse(jsonProfile));
        exportProfileToInputs(p);
    } else {
        p = new ProfileData();
    }

    function exportProfileToInputs(profileData) {
        postCodeInput.value = profileData.zipcode;
        streetInput.value = profileData.address;
        cityInput.value = profileData.town;
        firstNameInput.value= profileData.firstName;
        lastNameInput.value = profileData.lastName;
        birthdayInput.value = profileData.birthday;
        birthPlaceInput.value = profileData.birthplace;
        dateOutInput.value = profileData.dateOut;
        dateReleaseInput.value = profileData.dateRelease;
        if (profileData.reasons.includes(ReasonsEnum.work)) workInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.grocery)) groceryInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.health)) healthInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.family)) familyInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.sport)) sportInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.legal)) legalInput.checked = true;
        if (profileData.reasons.includes(ReasonsEnum.missions)) missionsInput.checked = true;
    }

    function exportProfileToInputsPlaceHolder(profileData) {
        postCodeInput.placeholder = profileData.zipcode;
        streetInput.placeholder = profileData.address;
        cityInput.placeholder = profileData.town;
        firstNameInput.placeholder= profileData.firstName;
        lastNameInput.placeholder = profileData.lastName;
        birthdayInput.placeholder = profileData.birthday;
        birthPlaceInput.placeholder = profileData.birthplace;
        dateOutInput.placeholder = profileData.dateOut;
        dateReleaseInput.placeholder = profileData.dateRelease;
    }

    function saveInputsToProfile(profileData) {
        profileData.zipcode = postCodeInput.value;
        profileData.address = streetInput.value;
        profileData.town = cityInput.value;

        profileData.firstName = firstNameInput.value;
        profileData.lastName = lastNameInput.value;

        profileData.birthday = birthdayInput.value;
        profileData.birthplace = birthPlaceInput.value;

        profileData.dateOut = dateOutInput.value;
        profileData.dateRelease = dateReleaseInput.value;

        p.reasons = [];
        if (workInput.checked) p.reasons.push(ReasonsEnum.work);
        if (groceryInput.checked) p.reasons.push(ReasonsEnum.grocery);
        if (healthInput.checked) p.reasons.push(ReasonsEnum.health);
        if (familyInput.checked) p.reasons.push(ReasonsEnum.family);
        if (sportInput.checked) p.reasons.push(ReasonsEnum.sport);
        if (legalInput.checked) p.reasons.push(ReasonsEnum.legal);
        if (missionsInput.checked) p.reasons.push(ReasonsEnum.missions);
    }

    document.getElementById('generate-pdf').onmouseup = async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        saveInputsToProfile(p);

        await downloadBlob(await generateAttestation(p), "attestation.pdf-" + DateFormat(p.dateRelease, "yyyy-mm-dd_HH-MM"));
    }

    findMeButon.addEventListener('click', geoFindMe);

    dateOutButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const nowMinus30 = new Date( Date.now() - 1000 * 60 * 30);
        dateOutInput.value = nowMinus30;
    });

    dateReleaseButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const nowMinus36 = new Date( Date.now() - 1000 * 60 * 36)
        dateReleaseInput.value = nowMinus36;
    });

    autoCompleteButon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        dateOutButton.click();
        dateReleaseButton.click();
        findMeButon.click();
    });

    removeFromLocalCacheButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.localStorage.clear();
        p = new ProfileData();
        exportProfileToInputs(p);
    });

    saveToLocalCacheButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        saveInputsToProfile(p)
        window.localStorage.setItem('profile', JSON.stringify(p)); // todo check if has local storage
    });
}

window.addEventListener('load', setupPage);
