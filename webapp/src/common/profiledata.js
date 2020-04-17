import DateFormat from 'dateformat';

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

export {
    ProfileData
}
