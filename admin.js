// admin.js

document.addEventListener('DOMContentLoaded', () => {

    // Keep a copy of local data.js defaults
    const DEFAULT_LEO_DATA = JSON.parse(JSON.stringify(LEO_DATA));

    // Login Logic
    const loginBtn = document.getElementById('loginBtn');
    const pwdInput = document.getElementById('adminPassword');
    const loginScreen = document.getElementById('login-screen');
    const mainAdmin = document.getElementById('main-admin');
    const loginError = document.getElementById('loginError');

    // Hashed Password Check (SHA-256)
    // The new password is: leoroars
    const ADMIN_PASSWORD_HASH = "17c863ec3773d16393baf24787aaf1719fb8b897878559fca8f60c5dd6a6233b";

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    loginBtn.addEventListener('click', checkAuth);
    pwdInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') checkAuth();
    });

    async function checkAuth() {
        const inputHash = await hashPassword(pwdInput.value);
        if(inputHash === ADMIN_PASSWORD_HASH) {
            loginScreen.style.display = 'none';
            mainAdmin.style.display = 'block';
        } else {
            loginError.style.display = 'block';
        }
    }

    // Generate Class Sections list: 12 A-J, 11 A-J, 10 A-J, 9 A-K
    const classSections = [];
    ['12', '11', '10'].forEach(grade => {
        for (let charCode = 65; charCode <= 74; charCode++) { // A to J
            classSections.push(grade + String.fromCharCode(charCode));
        }
    });
    for (let charCode = 65; charCode <= 75; charCode++) { // A to K
        classSections.push('9' + String.fromCharCode(charCode));
    }

    const lbClassSelect = document.getElementById('lbClass');
    const memClassSelect = document.getElementById('memClass');
    const editClassSelect = document.getElementById('edit-class');

    const optionsHTML = classSections.map(cls => `<option value="${cls}">${cls}</option>`).join('');
    
    if (lbClassSelect) lbClassSelect.innerHTML += optionsHTML;
    if (memClassSelect) memClassSelect.innerHTML += optionsHTML;
    if (editClassSelect) editClassSelect.innerHTML += optionsHTML;

    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(tab.getAttribute('data-target')).classList.add('active');
        });
    });

    // Helper: Calculate points
    function getPoints(position) {
        if(position === '1st') return 4;
        if(position === '2nd') return 3;
        if(position === '3rd') return 2;
        return 1;
    }

    // Populate Student Dropdown (Searchable Datalist)
    function populateDropdown() {
        const dataList = document.getElementById('studentNames');
        if(!dataList) return;
        
        // Gather all unique student names
        const allStudents = [];
        (LEO_DATA.studentsByClass || []).forEach(cls => {
            (cls.students || []).forEach(s => {
                if(!allStudents.includes(s.name)) allStudents.push(s.name);
            });
        });
        
        allStudents.sort(); // alphabetize
        
        dataList.innerHTML = allStudents.map(name => `<option value="${name}">`).join('');
    }

    // Refresh Lists visually & attach delete listeners
    function renderLists() {
        populateDropdown();

        // Leaderboard List
        const lbList = document.getElementById('lbList');
        if(lbList) lbList.innerHTML = (LEO_DATA.achievements || []).map((ach, i) => 
            `<div class="data-item">
                <div><b>${ach.student && ach.student !== "Class Point" ? ach.student : "Class: " + ach.classSection}</b> ${ach.classSection ? `(${ach.classSection})` : ''} - ${ach.event} <span class="gold-text">(+${ach.points} pts)</span></div>
                <button class="btn-danger" onclick="deleteItem('achievements', ${i})">Delete</button>
            </div>`
        ).reverse().join('');

        // News List
        const newsList = document.getElementById('newsList');
        if(newsList) newsList.innerHTML = (LEO_DATA.news || []).map((n, i) => 
            `<div class="data-item">
                <div><b>${n.title}</b> (${n.date}) ${n.img ? '<span style="color:#a0a5b1">[Has Photo]</span>' : ''}</div>
                <button class="btn-danger" onclick="deleteItem('news', ${i})">Delete</button>
            </div>`
        ).reverse().join('');

        // Member List (Flattened for display)
        const memberList = document.getElementById('memberList');
        if(memberList) {
            let membersHTML = '';
            (LEO_DATA.studentsByClass || []).forEach((cls, classIndex) => {
                if (!cls.students || cls.students.length === 0) return;
                membersHTML += `<div style="padding-top:1rem; color:var(--gold); border-bottom:1px solid #333; font-weight:bold;">${cls.className}</div>`;
                (cls.students || []).forEach((s, studentIndex) => {
                    membersHTML += `<div class="data-item">
                        <div>
                            <span>${s.name}</span>
                            <span style="color:${s.role === 'leo_council' ? 'gold' : s.role==='council' ? 'white' : s.role==='class_rep' ? 'orange' : '#aaa'}; font-size:0.8rem; margin-left:1rem;">[${s.role.replace('_', ' ').toUpperCase()}]</span>
                        </div>
                        <button class="btn-danger" onclick="deleteMember(${classIndex}, ${studentIndex})">Delete</button>
                    </div>`;
                });
            });
            memberList.innerHTML = membersHTML;
        }

        // Render Home Profiles (Teachers & Council) with file inputs
        const renderProfile = (person, type, index) => {
            if (!person) return '';
            const roleStr = person.role || 'Teacher';
            const posStr = person.position || 'Council';
            const subtitle = type === 'teachers' ? (roleStr + (person.class ? ' - ' + person.class : '')) : (posStr + (person.grade ? ' - Grade ' + person.grade : ''));
            return `
            <div class="data-item" style="align-items: center; gap: 1rem;">
                <div style="display:flex; align-items:center; gap:1rem; flex:1;">
                    <img src="${person.img || 'images/profile_male.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--gold);">
                    <div><b>${person.name || 'Unknown'}</b> <br><small style="color:#aaa;">${subtitle}</small></div>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <label style="cursor:pointer; background:var(--bg-card); padding:0.5rem 1rem; border:1px solid var(--border-color); border-radius:6px; font-size:0.8rem; margin:0;" class="btn-secondary">
                        Upload Photo
                        <input type="file" accept="image/*" style="display:none;" onchange="uploadImage(event, '${type}', ${index})">
                    </label>
                    <button class="btn" style="font-size:0.8rem; padding:0.5rem 1rem;" onclick="editProfile('${type}', ${index})">Edit Info</button>
                </div>
            </div>`;
        };

        const tList = document.getElementById('teachersProfileList');
        if(tList) {
            const teachers = Array.isArray(LEO_DATA.teachers) ? LEO_DATA.teachers : Object.values(LEO_DATA.teachers || {});
            tList.innerHTML = teachers.map((t, i) => renderProfile(t, 'teachers', i)).join('');
        }

        const cList = document.getElementById('councilProfileList');
        if(cList) {
            const council = Array.isArray(LEO_DATA.council) ? LEO_DATA.council : Object.values(LEO_DATA.council || {});
            cList.innerHTML = council.map((c, i) => renderProfile(c, 'council', i)).join('');
        }
    }
    
    // Helper to save to Firebase
    function saveToFirebase() {
        db.ref('leo_data').set(LEO_DATA).then(() => {
            console.log('Saved to Firebase successfully.');
        }).catch(err => {
            alert('Failed to save to Firebase: ' + err.message);
        });
    }

    let hasLoadedFromFirebase = false;

    // --- Firebase Data Sync ---
    const dbRef = db.ref('leo_data');
    dbRef.on('value', (snapshot) => {
        hasLoadedFromFirebase = true;
        const data = snapshot.val();
        if (data) {
            LEO_DATA = data;
            
            // Ensure arrays exist even if they were emptied in Firebase
            if (!LEO_DATA.achievements) LEO_DATA.achievements = [];
            if (!LEO_DATA.news) LEO_DATA.news = [];
            if (!LEO_DATA.studentsByClass) LEO_DATA.studentsByClass = [];
            
            // Seed defaults if empty because Add/Delete are removed for these
            let needsSave = false;
            if (!LEO_DATA.teachers || LEO_DATA.teachers.length === 0) {
                LEO_DATA.teachers = DEFAULT_LEO_DATA.teachers;
                needsSave = true;
            }
            if (!LEO_DATA.council || LEO_DATA.council.length === 0) {
                LEO_DATA.council = DEFAULT_LEO_DATA.council;
                needsSave = true;
            }

            if (needsSave) {
                dbRef.set(LEO_DATA).catch(err => console.warn("Firebase write skipped (database not created yet):", err));
            }
            
            renderLists();
        } else {
            dbRef.set(DEFAULT_LEO_DATA).catch(err => console.warn("Firebase write skipped (database not created yet):", err));
            renderLists();
        }
    }, (error) => {
        console.error("Firebase read error:", error);
        if (!hasLoadedFromFirebase) {
            renderLists();
        }
    });

    // Timeout fallback if Firebase doesn't respond at all within 2 seconds
    setTimeout(() => {
        if (!hasLoadedFromFirebase) {
            console.warn("Firebase connection timed out. Falling back to local data.");
            renderLists();
        }
    }, 2000);

    // EXPOSE Globals for delete functions on onClick
    window.deleteItem = function(listName, index) {
        const arr = LEO_DATA[listName];
        if (arr && confirm('Are you sure you want to delete this?')) {
            arr.splice(index, 1);
            saveToFirebase();
        }
    };

    // Global func for editing profile details — uses the modal
    const editModal = document.getElementById('edit-profile-modal');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    let currentEditState = { type: null, index: null };

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    saveEditBtn.addEventListener('click', () => {
        const { type, index } = currentEditState;
        if (type === null) return;

        const person = LEO_DATA[type][index];
        const isTeacher = type === 'teachers';
        const newName = document.getElementById('edit-name').value.trim();
        const newClass = document.getElementById('edit-class').value.trim();
        const classKey = isTeacher ? 'class' : 'grade';

        if (newName) person.name = newName;
        if (newClass) person[classKey] = newClass; // store as string to support "12A", "10B"

        editModal.style.display = 'none';
        saveToFirebase();
    });

    window.editProfile = function(type, index) {
        const person = LEO_DATA[type][index];
        const isTeacher = type === 'teachers';
        const classKey = isTeacher ? 'class' : 'grade';

        document.getElementById('edit-name').value = person.name || '';
        document.getElementById('edit-class').value = person[classKey] || '';
        document.getElementById('edit-class-label').textContent = isTeacher ? 'Class' : 'Grade & Section (e.g. 12A)';

        currentEditState = { type, index };
        editModal.style.display = 'flex';
    };

    window.deleteMember = function(classIndex, studentIndex) {
        if(confirm('Are you sure you want to delete this member?')) {
            const cls = LEO_DATA.studentsByClass[classIndex];
            if (cls && cls.students) {
                cls.students.splice(studentIndex, 1);
                if (cls.students.length === 0) {
                    LEO_DATA.studentsByClass.splice(classIndex, 1);
                }
            }
            saveToFirebase();
        }
    };

    // Global func for Image Uploading (Base64 + Cropper)
    let cropperOptions = { currentArrayType: null, currentIndex: null, cropperInstance: null };
    const cropModal = document.getElementById('crop-modal');
    const imageToCrop = document.getElementById('imageToCrop');

    window.uploadImage = function(event, arrayType, index) {
        const file = event.target.files[0];
        if(!file) return;

        cropperOptions.currentArrayType = arrayType;
        cropperOptions.currentIndex = index;

        const reader = new FileReader();
        reader.onload = function(e) {
            imageToCrop.src = e.target.result;
            cropModal.style.display = 'flex';
            
            // Re-initialize cropper
            if (cropperOptions.cropperInstance) cropperOptions.cropperInstance.destroy();
            cropperOptions.cropperInstance = new Cropper(imageToCrop, {
                aspectRatio: 1, // force strict square like whatsapp
                viewMode: 2,    // restricts crop box to fit within image
                autoCropArea: 0.8
            });
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input to allow choosing the same file again
    };

    // Handle Crop Apply
    document.getElementById('applyCropBtn').addEventListener('click', () => {
        if (!cropperOptions.cropperInstance) return;
        
        // Output a small nicely cropped image (super lightweight base64 string)
        const canvas = cropperOptions.cropperInstance.getCroppedCanvas({
            width: 300,
            height: 300
        });
        
        const smallBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        LEO_DATA[cropperOptions.currentArrayType][cropperOptions.currentIndex].img = smallBase64;
        
        cropModal.style.display = 'none';
        cropperOptions.cropperInstance.destroy();
        cropperOptions.cropperInstance = null;
        saveToFirebase();
    });

    // Handle Crop Cancel
    document.getElementById('cancelCropBtn').addEventListener('click', () => {
        cropModal.style.display = 'none';
        if (cropperOptions.cropperInstance) {
            cropperOptions.cropperInstance.destroy();
            cropperOptions.cropperInstance = null;
        }
    });

    // FORM: Leaderboard
    document.getElementById('leaderboardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const student = document.getElementById('lbName').value || "Class Point";
        const classSection = document.getElementById('lbClass').value;
        const event = document.getElementById('lbEvent').value;
        const points = parseInt(document.getElementById('lbPoints').value, 10);

        const positionMap = { 4: '1st Place', 3: '2nd Place', 2: '3rd Place', 1: 'Participation' };
        const position = positionMap[points] || '';

        if (!LEO_DATA.achievements) LEO_DATA.achievements = [];
        LEO_DATA.achievements.push({ student, classSection, event, points, position });
        e.target.reset();
        saveToFirebase();
    });

    // FORM: News
    document.getElementById('newsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('newsTitle').value;
        const date = document.getElementById('newsDate').value;
        const description = document.getElementById('newsDesc').value;
        const img = document.getElementById('newsImage').value;

        const newNews = { title, date, description };
        if(img) newNews.img = img;

        if (!LEO_DATA.news) LEO_DATA.news = [];
        LEO_DATA.news.push(newNews); 
        e.target.reset();
        saveToFirebase();
    });

    // FORM: Add Member
    document.getElementById('memberForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('memName').value;
        const className = document.getElementById('memClass').value;
        const role = document.getElementById('memRole').value;

        // Check if class exists in LEO_DATA
        let classGroup = LEO_DATA.studentsByClass.find(c => c.className.toLowerCase() === className.toLowerCase());
        if(!classGroup) {
            classGroup = { className: className, students: [] };
            LEO_DATA.studentsByClass.push(classGroup);
        }

        classGroup.students.push({ name, role });
        e.target.reset();
        saveToFirebase();
    });



    // --- EXCEL / CSV EXPORT ---
    window.exportStudentPerformance = function() {
        if (!LEO_DATA.achievements) return alert("No performance data available.");
        
        const pointsMap = {};
        const studentToClassMap = {};

        if (LEO_DATA.studentsByClass) {
            LEO_DATA.studentsByClass.forEach(cls => {
                (cls.students || []).forEach(s => {
                    studentToClassMap[s.name] = cls.className;
                });
            });
        }

        LEO_DATA.achievements.forEach(ach => {
            if(ach.student && ach.student !== "Class Point") {
                if(!pointsMap[ach.student]) {
                    pointsMap[ach.student] = { 
                        points: 0, 
                        classSection: ach.classSection || studentToClassMap[ach.student] || "Unknown",
                        events: []
                    };
                }
                pointsMap[ach.student].points += ach.points;
                pointsMap[ach.student].events.push(`${ach.event} (+${ach.points})`);
            }
        });

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Class/Section,Total Points,Events Participated\n";

        Object.keys(pointsMap).forEach(name => {
            const data = pointsMap[name];
            const eventsStr = `"${data.events.join(', ')}"`;
            csvContent += `${name},${data.classSection},${data.points},${eventsStr}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_performance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.exportMembersList = function() {
        if (!LEO_DATA.studentsByClass) return alert("No member data available.");

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Class,Assigned Role\n";

        (LEO_DATA.studentsByClass || []).forEach(cls => {
            (cls.students || []).forEach(s => {
                const roleFormatted = (s.role || '').replace('_', ' ').toUpperCase();
                csvContent += `${s.name},${cls.className},${roleFormatted}\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "members_roles_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

});
