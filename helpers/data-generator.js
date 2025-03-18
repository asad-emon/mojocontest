function generatePhoneNumber() {
    let prefix = "01" + "789345"[Math.floor(Math.random() * 6)]; // Choose from 7, 8, 9, 3, 4, 5
    let remainingDigits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
    return prefix + remainingDigits;
}

function generateBengaliName() {
    const firstNames = [
        "Rafiq", "Sohel", "Jakir", "Mohammad", "Sharif", "Tanvir", "Sumon", "Abdul", "Mehedi", "Arif",
        "Hasan", "Fahim", "Sakib", "Nayem", "Imran", "Rasel", "Kamrul", "Saiful", "Jubayer", "Naimul",
        "Mamun", "Nazmul", "Rubel", "Mahmud", "Ashraf", "Shafiq", "Kawsar", "Tariq", "Jamil", "Shuvo"
    ];
    
    const lastNames = [
        "Hossain", "Rahman", "Mia", "Sheikh", "Molla", "Sardar", "Gazi", "Sheikh",
        "Chowdhury", "Islam", "Jaman", "Bhuiyan", "Sikder", "Faruk", "Kabir", "Alam", "Karim", "Jahan",
        "Uddin", "Khaled", "Rashid", "Bashar", "Habib", "Ferdous", "Rokon", "Shakil", "Shams", "Bari"
    ];

    let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function generateAge() {
    return (Math.floor(Math.random() * (35 - 20 + 1)) + 20).toString();
}

function generateBangladeshLocation() {
    const locations = {
        "Dhaka": ["Dhanmondi", "Uttara", "Gulshan", "Mirpur", "Mohammadpur", "Savar"],
        "Chattogram": ["Pahartali", "Halishahar", "Patiya", "Sitakunda", "Anwara", "Boalkhali"],
        "Rajshahi": ["Paba", "Godagari", "Bagmara", "Charghat", "Durgapur", "Puthia"],
        "Khulna": ["Dumuria", "Batiaghata", "Fultola", "Paikgacha", "Terokhada", "Koyra"],
        "Barishal": ["Bakerganj", "Muladi", "Babuganj", "Banaripara", "Hizla", "Mehendiganj"],
        "Sylhet": ["Zakiganj", "Beanibazar", "Golapganj", "Jaintiapur", "Fenchuganj", "Companiganj"],
        "Rangpur": ["Gangachara", "Pirgachha", "Mithapukur", "Kaunia", "Taraganj", "Badarganj"],
        "Mymensingh": ["Trishal", "Muktagacha", "Fulbaria", "Bhaluka", "Gafargaon", "Islampur"]
    };

    let districts = Object.keys(locations);
    let district = districts[Math.floor(Math.random() * districts.length)];
    let upazila = locations[district][Math.floor(Math.random() * locations[district].length)];

    return `${upazila}, ${district}, Bangladesh`;
}

const data = {
    name: generateBengaliName(),
    phone: generatePhoneNumber(),
    age: generateAge(),
    location: generateBangladeshLocation(),
}

module.exports = { generateBengaliName, generatePhoneNumber, generateAge, generateBangladeshLocation }