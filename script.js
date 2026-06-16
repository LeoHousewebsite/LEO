document.addEventListener('DOMContentLoaded', () => {
    
    // Keep a copy of local data.js defaults
    const DEFAULT_LEO_DATA = JSON.parse(JSON.stringify(LEO_DATA));

    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            // Update Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Active Section
            sections.forEach(sec => {
                sec.classList.remove('active');
                if(sec.id === targetId) {
                    sec.classList.add('active');
                    // Retrigger animation
                    sec.style.animation = 'none';
                    sec.offsetHeight; // trigger reflow
                    sec.style.animation = null;
                }
            });
        });
    });

    // --- Navigation Mobile Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinksList = document.getElementById('navLinks');
    
    if (navToggle && navLinksList) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinksList.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const links = navLinksList.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinksList.classList.remove('active');
            });
        });
    }

    // --- Leaderboard Tabs Logic ---
    const lbTabs = document.querySelectorAll('.lb-tab-btn');
    const lbTables = document.querySelectorAll('.leaderboard-table');

    lbTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            lbTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            lbTables.forEach(table => {
                if(table.id === targetId) {
                    table.style.display = 'table';
                } else {
                    table.style.display = 'none';
                }
            });
        });
    });

    function renderPage() {
        // --- Populate Home: Teachers ---
        const teachersGrid = document.getElementById('teachersGrid');
        if (teachersGrid && LEO_DATA.teachers) {
            teachersGrid.innerHTML = LEO_DATA.teachers.map(t => `
                <div class="glass-card profile-card">
                    <div class="profile-img-container">
                        <img src="${t.img}" alt="${t.name}">
                    </div>
                    <h3>${t.name}</h3>
                    <div class="role">${t.role}</div>
                    <div class="meta">${t.class ? 'Class: ' + t.class : ''}</div>
                </div>
            `).join('');
        }

        // --- Populate Home: Council ---
        const councilGrid = document.getElementById('councilGrid');
        if (councilGrid && LEO_DATA.council) {
            councilGrid.innerHTML = LEO_DATA.council.map(c => `
                <div class="glass-card profile-card">
                    <div class="profile-img-container">
                        <img src="${c.img}" alt="${c.name}">
                    </div>
                    <h3>${c.name}</h3>
                    <div class="role">${c.position}</div>
                    <div class="meta">${c.grade ? 'Grade ' + c.grade : ''}</div>
                </div>
            `).join('');
        }

        // --- Process & Populate Leaderboard ---
        const leaderboardBody = document.getElementById('leaderboardBody');
        const classLeaderboardBody = document.getElementById('classLeaderboardBody');
        const achievementsList = document.getElementById('achievementsList');
        
        if (leaderboardBody && achievementsList && LEO_DATA.achievements) {
            // Build student-to-class lookup map for backward compatibility
            const studentToClassMap = {};
            if (LEO_DATA.studentsByClass) {
                LEO_DATA.studentsByClass.forEach(cls => {
                    (cls.students || []).forEach(s => {
                        studentToClassMap[s.name] = cls.className;
                    });
                });
            }

            // Calculate points
            const pointsMap = {};
            const classPointsMap = {};

            LEO_DATA.achievements.forEach(ach => {
                // Student Points
                if(ach.student && ach.student !== "Class Point") {
                    if(!pointsMap[ach.student]) pointsMap[ach.student] = 0;
                    pointsMap[ach.student] += ach.points;
                }

                // Class Points
                let classGroup = ach.classSection;
                if (!classGroup && ach.student && ach.student !== "Class Point") {
                    classGroup = studentToClassMap[ach.student] || "Unknown Class";
                }
                
                if (classGroup) {
                    if(!classPointsMap[classGroup]) classPointsMap[classGroup] = 0;
                    classPointsMap[classGroup] += ach.points;
                }
            });

            // Convert to array and sort
            const sortedStudents = Object.keys(pointsMap)
                .map(name => ({ name, points: pointsMap[name] }))
                .sort((a, b) => b.points - a.points);

            const sortedClasses = Object.keys(classPointsMap)
                .map(name => ({ name, points: classPointsMap[name] }))
                .sort((a, b) => b.points - a.points);

            // Render Student Table
            let currentRank = 1;
            leaderboardBody.innerHTML = sortedStudents.map((s, index) => {
                if (index > 0 && s.points < sortedStudents[index - 1].points) {
                    currentRank = index + 1;
                }
                const rankClass = currentRank <= 3 ? `rank-${currentRank}` : '';
                return `
                    <tr>
                        <td><span class="rank-badge ${rankClass}">${currentRank}</span></td>
                        <td style="font-weight: 600;">${s.name}</td>
                        <td class="gold-text"><b>${s.points}</b> pts</td>
                    </tr>
                `;
            }).join('');

            // Render Class Table
            if(classLeaderboardBody) {
                let currentClassRank = 1;
                classLeaderboardBody.innerHTML = sortedClasses.map((c, index) => {
                    if (index > 0 && c.points < sortedClasses[index - 1].points) {
                        currentClassRank = index + 1;
                    }
                    const rankClass = currentClassRank <= 3 ? `rank-${currentClassRank}` : '';
                    return `
                        <tr>
                            <td><span class="rank-badge ${rankClass}">${currentClassRank}</span></td>
                            <td style="font-weight: 600;">${c.name}</td>
                            <td class="gold-text"><b>${c.points}</b> pts</td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Recent Achievements
            achievementsList.innerHTML = LEO_DATA.achievements.map(ach => `
                <div class="achievement-row">
                    <div>
                        <h4 style="margin-bottom:0.2rem">${ach.student !== "Class Point" ? ach.student : "Class: " + ach.classSection}</h4>
                        <small class="text-muted">${ach.event} ${ach.classSection ? `(${ach.classSection})` : ''}</small>
                    </div>
                    <div>
                        ${ach.position ? `<span class="badge badge-gold">${ach.position}</span>` : ''}
                        <strong class="gold-text">+${ach.points}</strong>
                    </div>
                </div>
            `).join('');
        }

        if (membersContainer && LEO_DATA.studentsByClass) {
            // Sort classes: grade 9 first → 12 last, then A→Z within each grade
            const sortedClasses = [...LEO_DATA.studentsByClass]
                .filter(cls => cls.students && cls.students.length > 0)
                .sort((a, b) => {
                    const nameA = a.className ? String(a.className) : '';
                    const nameB = b.className ? String(b.className) : '';
                    const gradeA = parseInt(nameA) || 0;
                    const gradeB = parseInt(nameB) || 0;
                    
                    if (gradeA !== gradeB) {
                        return gradeA - gradeB;
                    }
                    
                    const secA = nameA.replace(/\d+/, '').trim();
                    const secB = nameB.replace(/\d+/, '').trim();
                    return secA.localeCompare(secB);
                });

            membersContainer.innerHTML = sortedClasses.map(cls => {
                // Title case function
                const toTitleCase = (str) => {
                    if (!str) return '';
                    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                };
                
                // Role weights for sorting
                const roleWeight = { 'class_rep': 1, 'leo_council': 2, 'council': 3, 'member': 4 };

                // Sort members by role, then alphabetically by name
                const sortedStudents = [...(cls.students || [])].sort((a, b) => {
                    const weightA = roleWeight[a.role] || 4;
                    const weightB = roleWeight[b.role] || 4;
                    if (weightA !== weightB) {
                        return weightA - weightB;
                    }
                    const studentA = a.name ? String(a.name) : '';
                    const studentB = b.name ? String(b.name) : '';
                    return studentA.localeCompare(studentB);
                });

                return `
                <div class="class-group">
                    <h3>${cls.className}</h3>
                    <div class="student-grid">
                        ${sortedStudents.map(s => {
                            const displayName = toTitleCase(s.name);
                            return `
                            <div class="student-pill ${s.role}">
                                ${displayName}
                            </div>
                        `}).join('')}
                    </div>
                </div>`;
            }).join('');
        }

        // --- Populate News ---
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid && LEO_DATA.news) {
            newsGrid.innerHTML = LEO_DATA.news.map(n => `
                <div class="glass-card news-card">
                    ${n.img ? `<img src="${n.img}" alt="News Image" class="news-img" style="width:100%; height:200px; object-fit:cover; border-radius:10px; margin-bottom:1rem;">` : ''}
                    <h3>${n.title}</h3>
                    <span class="date">${new Date(n.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <p>${n.description}</p>
                </div>
            `).join('');
        }
    }

    let hasLoadedFromFirebase = false;

    // --- Firebase Data Sync ---
    const dbRef = db.ref('leo_data');
    dbRef.on('value', (snapshot) => {
        hasLoadedFromFirebase = true;
        const data = snapshot.val();
        if (data) {
            LEO_DATA = data;
            
            // Seed individual default arrays if they are missing or empty in Firebase
            let needsSave = false;
            if (!LEO_DATA.teachers || LEO_DATA.teachers.length === 0) {
                LEO_DATA.teachers = DEFAULT_LEO_DATA.teachers;
                needsSave = true;
            }
            if (!LEO_DATA.council || LEO_DATA.council.length === 0) {
                LEO_DATA.council = DEFAULT_LEO_DATA.council;
                needsSave = true;
            }
            if (!LEO_DATA.studentsByClass || LEO_DATA.studentsByClass.length === 0) {
                LEO_DATA.studentsByClass = DEFAULT_LEO_DATA.studentsByClass;
                needsSave = true;
            }
            if (!LEO_DATA.news || LEO_DATA.news.length === 0) {
                LEO_DATA.news = DEFAULT_LEO_DATA.news;
                needsSave = true;
            }
            if (!LEO_DATA.achievements) {
                LEO_DATA.achievements = [];
                needsSave = true;
            }
            
            if (needsSave) {
                dbRef.set(LEO_DATA).catch(err => console.warn("Firebase write skipped (database not created yet):", err));
            }
            renderPage();
        } else {
            // First time setup: push the default LEO_DATA to Firebase
            dbRef.set(DEFAULT_LEO_DATA).catch(err => console.warn("Firebase write skipped (database not created yet):", err));
            renderPage();
        }
    }, (error) => {
        console.error("Firebase read error:", error);
        if (!hasLoadedFromFirebase) {
            renderPage(); // fallback to local data rendering
        }
    });

    // Timeout fallback if Firebase doesn't respond at all within 2 seconds
    setTimeout(() => {
        if (!hasLoadedFromFirebase) {
            console.warn("Firebase connection timed out. Falling back to local data.");
            renderPage();
        }
    }, 2000);

});
