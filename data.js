// Default data — seeded to Firebase on first load if the database is empty.
// All of this can be edited live via Admin Dashboard (admin.html)
// → Home Profiles tab: edit teacher/council names, grades & photos
// → Manage Members tab: add/remove house members
// → Log Results tab: log event results for the leaderboard
var LEO_DATA = {
    "teachers": [
        {
            "name": "Mr. John Carter",
            "role": "House Master",
            "class": "12A",
            "img": "images/profile_teacher.png"
        },
        {
            "name": "Ms. Priya Nair",
            "role": "House Mistress",
            "class": "10B",
            "img": "images/profile_teacher.png"
        }
    ],
    "council": [
        {
            "name": "Ryan Abraham",
            "position": "President",
            "grade": "12A",
            "img": "images/profile_male.png"
        },
        {
            "name": "Sarah Mathew",
            "position": "President",
            "grade": "12B",
            "img": "images/profile_female.png"
        },
        {
            "name": "Kevin Joseph",
            "position": "Secretary",
            "grade": "11A",
            "img": "images/profile_male.png"
        },
        {
            "name": "Ananya Pillai",
            "position": "Secretary",
            "grade": "11B",
            "img": "images/profile_female.png"
        },
        {
            "name": "Daniel George",
            "position": "Deputy Secretary",
            "grade": "10A",
            "img": "images/profile_male.png"
        },
        {
            "name": "Meera Rajan",
            "position": "Deputy Secretary",
            "grade": "10B",
            "img": "images/profile_female.png"
        },
        {
            "name": "Aidan Thomas",
            "position": "Council Member",
            "grade": "9A",
            "img": "images/profile_male.png"
        },
        {
            "name": "Nadia Hassan",
            "position": "Council Member",
            "grade": "9B",
            "img": "images/profile_female.png"
        }
    ],
    "achievements": [],
    "studentsByClass": [
        {
            "className": "Grade 12",
            "students": [
                { "name": "Ryan Abraham", "role": "leo_council" },
                { "name": "Sarah Mathew", "role": "leo_council" },
                { "name": "James Philip", "role": "class_rep" },
                { "name": "Lena Varghese", "role": "member" }
            ]
        },
        {
            "className": "Grade 11",
            "students": [
                { "name": "Kevin Joseph", "role": "leo_council" },
                { "name": "Ananya Pillai", "role": "leo_council" },
                { "name": "Omar Khalid", "role": "class_rep" },
                { "name": "Riya Sanjay", "role": "member" }
            ]
        },
        {
            "className": "Grade 10",
            "students": [
                { "name": "Daniel George", "role": "leo_council" },
                { "name": "Meera Rajan", "role": "leo_council" },
                { "name": "Farid Al-Amin", "role": "council" },
                { "name": "Leah Simon", "role": "member" }
            ]
        },
        {
            "className": "Grade 9",
            "students": [
                { "name": "Aidan Thomas", "role": "leo_council" },
                { "name": "Nadia Hassan", "role": "leo_council" },
                { "name": "Chris Emmanuel", "role": "council" },
                { "name": "Zara Biju", "role": "member" }
            ]
        }
    ],
    "news": [
        {
            "title": "Annual Sports Meet",
            "date": "2026-05-20",
            "description": "Get ready to show courage, strength, and pride on the tracks. All members must be present!"
        },
        {
            "title": "Debate Finals",
            "date": "2026-06-02",
            "description": "Our Leo House debate team faces off in the grand finals. Come support them at the auditorium."
        },
        {
            "title": "House Activity Day",
            "date": "2026-06-20",
            "description": "A day filled with fun activities, teamwork, and points to be won for the leaderboard."
        }
    ]
};