import { data } from './data.js';

const select = document.getElementById("Section_Batch");
const subjectSelect = document.getElementById("subject");
const popup = document.getElementById("popup");
const swh = document.getElementById("switch");
const copy = document.querySelector("#copy");
const nameButton = document.querySelector('.toggle-names-switch-button');
let str = ""; // Global for WhatsApp
generate();

select.addEventListener('change', generate);
subjectSelect.addEventListener('change', () => {
    popup.style.display = subjectSelect.value === 'other' ? 'block' : 'none';
    if (subjectSelect.value !== 'other') document.getElementById("otherText").value = '';
    display();
});
swh.addEventListener('change', generate);
nameButton.addEventListener('change', display);

function generate() {
    const parent = document.querySelector(".data");
    parent.innerHTML = "";
    let currentSection = select.value;
    const sectionsToShow = currentSection === 'IT'
        ? ['IT-A', 'IT-B', 'IT-C']
        : [currentSection];
    let content = "";

    sectionsToShow.forEach(section => {
        content += `<h2 style="margin-top: 1rem; color: gray;">${section}</h2>`;
        data.forEach(student => {
            if (student.Section === section) {
                const attendanceClass = swh.checked ? "red" : "green";
                const attendanceText = swh.checked ? "Absent" : "Present";
                content += `
                    <div class="tab">
                        <p><span>Roll Number :</span>${student.Id}</p>
                        <p><span>Name :</span>${student.Name}</p>
                        <div class="Attendance ${attendanceClass}" id="${student.Id}" name="${student.Name}" is-present="${!swh.checked}">
                            <p>${attendanceText}</p>
                        </div>
                    </div>`;
            }
        });
    });

    parent.innerHTML = content;
    display();
    attachClickListeners();
}

function attachClickListeners() {
    const tabs = document.querySelectorAll(".Attendance");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const isPresent = tab.getAttribute("is-present") === "true";
            const newStatus = !isPresent;
            tab.setAttribute("is-present", String(newStatus));
            tab.classList.toggle("green", newStatus);
            tab.classList.toggle("red", !newStatus);
            tab.innerHTML = `<p>${newStatus ? "Present" : "Absent"}</p>`;
            display();
        });
    });
}

function display() {
    const presentEls = document.querySelectorAll('.Attendance');
    let presentList = "", absentList = "";
    let countPresent = 0, countAbsent = 0;
    const withNames = nameButton.checked;

    presentEls.forEach(el => {
        const isPresent = el.getAttribute('is-present') === 'true';
        const name = el.getAttribute('name');
        const id = el.id;
        const prefix = id.substring(0, 3);
        const type = id.substring(4, 5);
        let entry;

        if (prefix === '249' && type === '1') {
            entry = `${id.slice(8, 10)}`;
        } else if (prefix === '239') {
            entry = `23-${id.slice(8, 10)}`;
        } else if (prefix === '249' && type === '5') {
            entry = `24LE-${id.slice(8, 10)}`;
        } else {
            entry = `LE${id.slice(8, 10)}`;
        }

        if (withNames) entry += ` - ${name}`;
        if (isPresent) {
            presentList += `${entry}, `;
            countPresent++;
        } else {
            absentList += `${entry}, `;
            countAbsent++;
        }
    });

    presentList = presentList.slice(0, -2);
    absentList = absentList.slice(0, -2);

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const sectionText = select.options[select.selectedIndex].text;
    let subject = subjectSelect.value === 'other'
        ? document.getElementById("otherText").value
        : subjectSelect.value;

    str = `${sectionText} (II year) Attendance\n\n`;
    str += `Presentees (${countPresent}):\n${presentList}\n\n`;
    str += `Absentees (${countAbsent}):\n${absentList}\n\n`;
    str += `In ${subject} on ${currentDate}`;

    const displayBox = document.getElementById("display");
    displayBox.value = str;
    displayBox.style.borderColor = countPresent > countAbsent ? 'lightgreen' : countPresent < countAbsent ? '#ff5c5c' : '#f6f672';
}

// Copy to clipboard
copy.addEventListener('click', async () => {
    const display = document.getElementById("display");
    await navigator.clipboard.writeText(display.value);
    copy.classList.add("active");
    setTimeout(() => copy.classList.remove("active"), 1500);
});

// WhatsApp
document.querySelector(".Whatsapp").addEventListener("click", () => {
    const encoded = encodeURIComponent(str);
    window.open(`https://wa.me/?text=${encoded}`);
});

// Reset
document.getElementById("reset").addEventListener("click", () => {
    const attendances = document.querySelectorAll('.Attendance');
    const isAbsent = swh.checked;
    attendances.forEach(el => {
        el.setAttribute("is-present", String(!isAbsent));
        el.classList = `Attendance ${isAbsent ? 'red' : 'green'}`;
        el.innerHTML = `<p>${isAbsent ? "Absent" : "Present"}</p>`;
    });
    nameButton.checked = false;
    document.getElementById("display").value = '';
    document.getElementById("display").style.borderColor = 'rgb(165, 165, 165)';
});
