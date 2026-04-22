document.addEventListener('DOMContentLoaded', () => {
    
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
                <div class="meta">Class: ${t.class} <br> Phone: ${t.phone}</div>
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
                <div class="meta">Grade ${c.grade}</div>
            </div>
        `).join('');
    }

    // --- Process & Populate Leaderboard ---
    const leaderboardBody = document.getElementById('leaderboardBody');
    const achievementsList = document.getElementById('achievementsList');
    
    if (leaderboardBody && achievementsList && LEO_DATA.achievements) {
        // Calculate points
        const pointsMap = {};
        LEO_DATA.achievements.forEach(ach => {
            if(!pointsMap[ach.student]) pointsMap[ach.student] = 0;
            pointsMap[ach.student] += ach.points;
        });

        // Convert to array and sort
        const sortedStudents = Object.keys(pointsMap)
            .map(name => ({ name, points: pointsMap[name] }))
            .sort((a, b) => b.points - a.points);

        // Render Table
        leaderboardBody.innerHTML = sortedStudents.map((s, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            return `
                <tr>
                    <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                    <td style="font-weight: 600;">${s.name}</td>
                    <td class="gold-text"><b>${s.points}</b> pts</td>
                </tr>
            `;
        }).join('');

        // Render Recent Achievements
        achievementsList.innerHTML = LEO_DATA.achievements.map(ach => `
            <div class="achievement-row">
                <div>
                    <h4 style="margin-bottom:0.2rem">${ach.student}</h4>
                    <small class="text-muted">${ach.event}</small>
                </div>
                <div>
                    <span class="badge badge-gold">${ach.position}</span>
                    <strong class="gold-text">+${ach.points}</strong>
                </div>
            </div>
        `).join('');
    }

    // --- Populate Members ---
    const membersContainer = document.getElementById('membersContainer');
    if (membersContainer && LEO_DATA.studentsByClass) {
        membersContainer.innerHTML = LEO_DATA.studentsByClass.map(cls => `
            <div class="class-group">
                <h3>${cls.className}</h3>
                <div class="student-grid">
                    ${cls.students.map(s => `
                        <div class="student-pill ${s.role}">
                            ${s.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
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

});
