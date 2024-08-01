import Swal from "sweetalert2";

const form = document.querySelector("form");
const nameInput = document.querySelector("input[name='name']");
const propietaryInput = document.querySelector("input[name='propietary']");
const emailInput = document.querySelector("input[name='email']");
const dateInput = document.querySelector("input[name='date']");
const symptomsInput = document.querySelector("#symptoms");
const pacientContainer = document.querySelector("#list");
const submitButton = form.querySelector("button[type='submit']");

const objPacient = {
    id: 0,
    name: "",
    propietary: "",
    email: "",
    date: "",
    symptoms: "",
};

let arrPacients = [];
let editing = false;

function initApp() {
    arrPacients = JSON.parse(localStorage.getItem("arrPacients")) ?? [];
    showPacients();
    resetDate();
    form.addEventListener("submit", validatePacient);
    nameInput.addEventListener("blur", validateInput);
    propietaryInput.addEventListener("blur", validateInput); 
    emailInput.addEventListener("blur", validateInput); 
    dateInput.addEventListener("blur", validateInput); 
    symptomsInput.addEventListener("blur", validateInput); 
}

const showPacients = () => {
    pacientContainer.innerHTML = ''; // Limpiar la lista de pacientes
    if (arrPacients.length === 0) {
        const pMsj = document.createElement("P");
        pMsj.textContent = "No Hay Pacientes"; 
        pMsj.classList.add("text-center", "bg-white", "p-3");
        pacientContainer.appendChild(pMsj);
        return;
    }
    arrPacients.forEach(pacient => {
        const { id, name, propietary, email, date, symptoms } = pacient;
        
        const divContainer = document.createElement("DIV");
        divContainer.classList.add("flex", "flex-col", "gap-3", "px-2", "py-3", "bg-white", "rounded-md");

        const h2 = document.createElement("H2");
        h2.textContent = `ID: ${id} - ${name}`;
        h2.classList.add("text-2xl", "font-black", "uppercase");

        const divInfo = document.createElement("DIV");
        divInfo.innerHTML = `              
            <p><span class="font-bold">Propietario: </span>${propietary}</p>
            <p><span class="font-bold">Email: </span>${email}</p>
            <p><span class="font-bold">Fecha: </span>${date}</p>
            <p><span class="font-bold">Hora: </span>12:00</p>
            <p><span class="font-bold">Sintomas: </span>${symptoms}</p>`;
        
        const divBtns = document.createElement("DIV");
        divBtns.classList.add("flex", "justify-between");
        divBtns.setAttribute('id', "btnPacient-container");

        const btnDelete = document.createElement("BUTTON");
        btnDelete.classList.add("text-white", "uppercase", "bg-red-500", "px-4", "py-2", "hover:opacity-50", "transition-all");
        btnDelete.textContent = "Eliminar";
        btnDelete.onclick = () => {
            Swal.fire({
                title: "Estas Seguro?",
                text: "No puedes desde hacer esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si, eliminalo!"
            }).then((result) => {
                if (result.isConfirmed) {
                    deletePacient(id);
                    Swal.fire({
                        title: "Eliminado!",
                        text: "El paciente ha sido eliminado.",
                        icon: "success"
                    }).then( () => location.reload());
                }
            });
        };

        const btnEdit = document.createElement("BUTTON");
        btnEdit.classList.add("text-white", "uppercase", "bg-cyan-700", "px-4", "py-2", "hover:opacity-50", "transition-all");
        btnEdit.textContent = "Editar";
        btnEdit.onclick = () => loadPacientForEdit(pacient);

        divBtns.appendChild(btnDelete);
        divBtns.appendChild(btnEdit);

        divContainer.appendChild(h2);
        divContainer.appendChild(divInfo);
        divContainer.appendChild(divBtns);

        pacientContainer.appendChild(divContainer);
    });
};

const validatePacient = e => {
    e.preventDefault();

    const nameValue = nameInput.value.toLowerCase().trim();
    const propietaryValue = propietaryInput.value.toLowerCase().trim();
    const emailValue = emailInput.value.toLowerCase().trim();
    const dateValue = dateInput.value.toLowerCase().trim();
    const symptomsValue = symptomsInput.value.toLowerCase().trim();

    objPacient.name = nameValue;
    objPacient.propietary = propietaryValue;
    objPacient.email = emailValue;
    objPacient.date = dateValue;
    objPacient.symptoms = symptomsValue; 
    
    let pass = true;
    Object.entries(objPacient).forEach(([key, value]) => {
        if (key !== 'id' && value === '') {
            showAlerts("NO puede estar vacio", key);
            pass = false;
            return;
        }
        if ((key === 'name' || key === 'propietary') && value.length > 40) {
            showAlerts("Solo está permitido un MAXIMO de 40 caracteres!", key);
            pass = false;
            return; 
        }
        if ((key === 'name' || key === 'propietary') && value.length < 3) {
            showAlerts("Solo está permitido un MINIMO de 3 caracteres!", key);
            pass = false;
            return; 
        }
        if (key === 'email' && !verifyEmail(objPacient[key]) && value.length > 0) {
            showAlerts("Introduce un email VALIDO!", key);
            pass = false;
            return; 
        }
        if (key === 'symptoms' && value.length > 250) {
            showAlerts("Solo está permitido un MAXIMO de 250 caracteres!", key);
            pass = false;
            return; 
        }
    });
    if (pass) {
        if (editing) {
            updatePacient();
        } else {
            saveInLocalStorage();
        }
        clearForm();
    }
};

const getNextId = () => {
    const currentId = parseInt(localStorage.getItem("currentId")) || 0;
    const nextId = currentId + 1;
    localStorage.setItem("currentId", nextId);
    return nextId;
};

const verifyEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const showAlerts = (msj, key) => {
    const location = assignLocation(key);
    clearAlert(location);

    const alertP = document.createElement("P");
    alertP.textContent = msj;
    alertP.classList.add("text-left", "text-rose-500", "text-sm");

    location.children[1].classList.add("border-2", "border-rose-500");

    location.appendChild(alertP);
};

const clearAlert = location => {
    while (location.querySelector("p")) {
        location.removeChild(location.querySelector("p"));
    }
};

const assignLocation = key => {
    let element;
    if (key === nameInput.getAttribute("name")) {
        element = nameInput.parentElement;
    } 
    if (key === propietaryInput.getAttribute("name")) {
        element = propietaryInput.parentElement;
    } 
    if (key === emailInput.getAttribute("name")) {
        element = emailInput.parentElement;
    } 
    if (key === dateInput.getAttribute("name")) {
        element = dateInput.parentElement;
    } 
    if (key === symptomsInput.getAttribute("name")) {
        element = symptomsInput.parentElement;
    } 
    return element;
};

const validateInput = e => {
    if (e.target.value !== '') {
        clearAlert(e.target.parentElement);
    }
};

const clearForm = () => {
    form.reset();
    objPacient.id = 0;
    objPacient.name = '';
    objPacient.propietary = '';
    objPacient.email = '';
    objPacient.date = '';
    objPacient.symptoms = '';
    editing = false;
    submitButton.textContent = "Agregar Paciente";
};

const saveInLocalStorage = () => {
    objPacient.id = getNextId();
    arrPacients = [...arrPacients, { ...objPacient }];
    localStorage.setItem("arrPacients", JSON.stringify(arrPacients));
    Swal.fire({
        title: "Guardado Exitosamente!",
        text: "Haz click para continuar!",
        icon: "success"
    }).then(() => location.reload());
};

const updatePacient = () => {
    arrPacients = arrPacients.map(pacient => pacient.id === objPacient.id ? { ...objPacient } : pacient);
    localStorage.setItem("arrPacients", JSON.stringify(arrPacients));
    Swal.fire({
        title: "Actualizado Exitosamente!",
        text: "Haz click para continuar!",
        icon: "success"
    }).then(() => location.reload());
};

const deletePacient = id => {
    arrPacients = arrPacients.filter(pacient =>  pacient.id !== id);
    localStorage.setItem("arrPacients", JSON.stringify(arrPacients));
};

const loadPacientForEdit = pacient => {
    const { id, name, propietary, email, date, symptoms } = pacient;

    objPacient.id = id;
    nameInput.value = name;
    propietaryInput.value = propietary;
    emailInput.value = email;
    dateInput.value = date;
    symptomsInput.value = symptoms;

    editing = true;
    submitButton.textContent = "Editar Paciente";
};

function resetDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const minDay = `${year}-${month}-${day}`;
    
    dateInput.setAttribute('min', minDay);
};

document.addEventListener("DOMContentLoaded", initApp);
