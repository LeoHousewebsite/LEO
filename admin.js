// admin.js

document.addEventListener('DOMContentLoaded', () => {

    // Login Logic
    const loginBtn = document.getElementById('loginBtn');
    const pwdInput = document.getElementById('adminPassword');
    const loginScreen = document.getElementById('login-screen');
    const mainAdmin = document.getElementById('main-admin');
    const loginError = document.getElementById('loginError');

    const ADMIN_PASSWORD = "roars"; // Set your password here

    loginBtn.addEventListener('click', checkAuth);
    pwdInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') checkAuth();
    });

    function checkAuth() {
        if(pwdInput.value === ADMIN_PASSWORD) {
            loginScreen.style.display = 'none';
            mainAdmin.style.display = 'block';
        } else {
            loginError.style.display = 'block';
        }
    }

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
        LEO_DATA.studentsByClass.forEach(cls => {
            cls.students.forEach(s => {
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
        lbList.innerHTML = LEO_DATA.achievements.map((ach, i) => 
            `<div class="data-item">
                <div><b>${ach.student}</b> - ${ach.event} <span class="gold-text">(${ach.position}, +${ach.points} pts)</span></div>
                <button class="btn-danger" onclick="deleteItem('achievements', ${i})">Delete</button>
            </div>`
        ).reverse().join('');

        // News List
        const newsList = document.getElementById('newsList');
        newsList.innerHTML = LEO_DATA.news.map((n, i) => 
            `<div class="data-item">
                <div><b>${n.title}</b> (${n.date}) ${n.img ? '<span style="color:#a0a5b1">[Has Photo]</span>' : ''}</div>
                <button class="btn-danger" onclick="deleteItem('news', ${i})">Delete</button>
            </div>`
        ).reverse().join('');

        // Member List (Flattened for display)
        const memberList = document.getElementById('memberList');
        let membersHTML = '';
        LEO_DATA.studentsByClass.forEach((cls, classIndex) => {
            membersHTML += `<div style="padding-top:1rem; color:var(--gold); border-bottom:1px solid #333; font-weight:bold;">${cls.className}</div>`;
            cls.students.forEach((s, studentIndex) => {
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

        // Render Home Profiles (Teachers & Council) with file inputs
        const renderProfile = (person, type, index) => `
            <div class="data-item" style="align-items: center;">
                <div style="display:flex; align-items:center; gap:1rem;">
                    <img src="${person.img}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--gold);">
                    <div><b>${person.name}</b> <br><small style="color:#aaa;">${person.role || person.position}</small></div>
                </div>
                <div>
                    <label style="cursor:pointer; background:var(--bg-card); padding:0.5rem 1rem; border:1px solid var(--border-color); border-radius:6px; font-size:0.8rem; margin:0;" class="btn-secondary">
                        Upload Photo
                        <input type="file" accept="image/*" style="display:none;" onchange="uploadImage(event, '${type}', ${index})">
                    </label>
                </div>
            </div>`;

        const tList = document.getElementById('teachersProfileList');
        if(tList) tList.innerHTML = LEO_DATA.teachers.map((t, i) => renderProfile(t, 'teachers', i)).join('');

        const cList = document.getElementById('councilProfileList');
        if(cList) cList.innerHTML = LEO_DATA.council.map((c, i) => renderProfile(c, 'council', i)).join('');
    }
    
    // Initial Render
    renderLists();

    // EXPOSE Globals for delete functions on onClick
    window.deleteItem = function(listName, reverseIndex) {
        // Reverse array indexing fix since we used .reverse() in map!
        const arr = LEO_DATA[listName];
        const actualIndex = arr.length - 1 - reverseIndex;
        if(confirm('Are you sure you want to delete this?')) {
            arr.splice(actualIndex, 1);
            renderLists();
        }
    };

    window.deleteMember = function(classIndex, studentIndex) {
        if(confirm('Are you sure you want to delete this member?')) {
            LEO_DATA.studentsByClass[classIndex].students.splice(studentIndex, 1);
            renderLists();
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
        renderLists();
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
        const student = document.getElementById('lbName').value;
        const event = document.getElementById('lbEvent').value;
        const position = document.getElementById('lbPosition').value;
        const points = getPoints(position);

        if(!student) return alert("Please select a student.");

        LEO_DATA.achievements.push({ student, event, position, points });
        e.target.reset();
        renderLists();
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

        LEO_DATA.news.push(newNews); 
        e.target.reset();
        renderLists();
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
        renderLists();
    });

    // Generate JSON string
    function getFileContent() {
        return `const LEO_DATA = ${JSON.stringify(LEO_DATA, null, 4)};`;
    }

    // COPY TO CLIPBOARD
    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = getFileContent();
        navigator.clipboard.writeText(text).then(() => {
            alert("Code Copied! Open 'data.js' in your code editor, Select All, and Paste!");
        }).catch(err => {
            alert("Failed to copy. Use the download button instead.");
        });
    });

    // EXPORT DOWNLOAD
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const fileContent = getFileContent();
        const blob = new Blob([fileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

});
