import DateFormat from 'dateformat';

class ProfileData {
    static from(json){
        return Object.assign(new ProfileData(), json);
    }

    static newWithDefault() {
        return new ProfileData("Macro",
            "Manu",
             "21/12/1977",
             "Amiens",
             "Palais de l'Élysée, Paris 8e",
             "75008",
             "Paris",
             new Date(),
             new Date(),
             []
        );
    }

    constructor(
        lastName = "",
        firstName = "",
        birthday = "",
        birthplace = "",
        address = "",
        zipcode = "",
        town = "",
        dateOut = "",
        dateRelease = "",
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

    getFormattedBirthday() {
        return DateFormat(this.birthday, "dd/mm/yyyy");
    }

    getFormattedDateRelease() {
        return DateFormat(this.dateRelease, "dd/mm/yyyy");
    }

    getFormattedHourRelease() {
        return DateFormat(this.dateRelease, "HH\'h\'MM");
    }

    getFormattedDateOut() {
        return DateFormat(this.dateOut, "dd/mm/yyyy");
    }

    getFormattedHourOut() {
        return DateFormat(this.dateOut, "HH\'h\'MM");
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
