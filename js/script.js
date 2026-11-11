
// =====================================
// 1. ELEMENTOS DEL MENU
// =====================================

const menuBtn = document.getElementById("menuBtn");
const mainMenu = document.getElementById("mainMenu");


// =====================================
// 2. ABRIR Y CERRAR MENU
// =====================================

menuBtn.addEventListener("click", function () {

    const isOpen = mainMenu.classList.toggle("open");

    menuBtn.setAttribute("aria-expanded", isOpen);

    menuBtn.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
    );

});

// =====================================
// 4. FUNCION CERRAR MENU
// =====================================

function closeMenu() {

    mainMenu.classList.remove("open");

    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.setAttribute("aria-label", "Abrir menú");

}


// =====================================
// 5. CERRAR AL HACER CLIC FUERA
// =====================================

document.addEventListener("click", function (event) {

    const clickInsideMenu = mainMenu.contains(event.target);
    const clickMenuButton = menuBtn.contains(event.target);

    if (!clickInsideMenu && !clickMenuButton) {

        closeMenu();

    }

});


// =====================================
// 6. CERRAR CON ESCAPE
// =====================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeMenu();

    }

});


// =====================================
// 7. AJUSTAR AL CAMBIAR PANTALLA
// =====================================

window.addEventListener("resize", function () {

    if (window.innerWidth > 760) {

        closeMenu();

    }

});


// =====================================
// 8. ACTIVAR ICONOS LUCIDE
// =====================================

if (window.lucide) {

    lucide.createIcons();

}





/* =====================================
   MODULO DE ACTIVIDADES
   Crear - Editar - Eliminar - Guardar
===================================== */

(() => {

    const activitiesBody = document.getElementById("activitiesBody");
    const filterInput = document.getElementById("filterInput");
    const createBtn = document.getElementById("createBtn");
    const activityDialog = document.getElementById("activityDialog");
    const activityForm = document.getElementById("activityForm");
    const closeDialog = document.getElementById("closeDialog");
    const cancelBtn = document.getElementById("cancelBtn");
    const emptyMessage = document.getElementById("emptyMessage");

    if (!activitiesBody || !activityDialog) return;

    const STORAGE_KEY = "abs_activities";

    // Datos iniciales
    const initialActivities = [
        {
            id: 1,
            subject: "Seguimiento de clientes",
            responsible: "Administrador",
            dueDate: "2026-11-10",
            status: "Pendiente"
        },
        {
            id: 2,
            subject: "Revisión de solicitudes",
            responsible: "Usuario 2",
            dueDate: "2026-11-12",
            status: "Completada"
        }
    ];

    // Cargar datos guardados
    function loadActivities() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Error al cargar actividades:", error);
        }

        return [...initialActivities];
    }

    let activities = loadActivities();
    let editingId = null;

    // Guardar datos
    function saveActivities() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(activities)
            );
        } catch (error) {
            alert("No fue posible guardar los cambios en el navegador.");
            console.error(error);
        }
    }

    // Mostrar actividades
    function renderActivities(data) {

        activitiesBody.innerHTML = "";

        emptyMessage.hidden = data.length > 0;

        data.forEach(activity => {

            const row = document.createElement("tr");

            const subjectCell = document.createElement("td");
            subjectCell.textContent = activity.subject;

            const responsibleCell = document.createElement("td");
            responsibleCell.textContent = activity.responsible;

            const dateCell = document.createElement("td");

            const dateParts = activity.dueDate.split("-");

            dateCell.textContent =
                `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            const statusCell = document.createElement("td");

            const statusLabel = document.createElement("span");

            statusLabel.className =
                activity.status === "Completada"
                    ? "status status-completed"
                    : "status status-pending";

            statusLabel.textContent = activity.status;

            statusCell.appendChild(statusLabel);

            // Columna de acciones
            const actionsCell = document.createElement("td");

            const actionsContainer = document.createElement("div");
            actionsContainer.className = "action-buttons";

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "action-btn edit-btn";
            editButton.textContent = "✏";
            editButton.title = "Editar actividad";
            editButton.setAttribute("aria-label", "Editar actividad");

            editButton.addEventListener("click", () => {
                editActivity(activity.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.textContent = "✕";
            deleteButton.title = "Eliminar actividad";
            deleteButton.setAttribute("aria-label", "Eliminar actividad");

            deleteButton.addEventListener("click", () => {
                deleteActivity(activity.id);
            });

            actionsContainer.append(editButton, deleteButton);
            actionsCell.appendChild(actionsContainer);

            row.append(
                subjectCell,
                responsibleCell,
                dateCell,
                statusCell,
                actionsCell
            );

            activitiesBody.appendChild(row);
        });
    }

    // Abrir formulario para crear
    createBtn.addEventListener("click", () => {

        editingId = null;

        activityForm.reset();

        activityDialog.querySelector("h2").textContent =
            "Crear actividad";

        activityForm.querySelector(
            'button[type="submit"]'
        ).textContent = "Guardar actividad";

        activityDialog.showModal();
    });

    // Editar actividad
    function editActivity(id) {

        const activity = activities.find(item => item.id === id);

        if (!activity) return;

        editingId = id;

        document.getElementById("subject").value =
            activity.subject;

        document.getElementById("responsible").value =
            activity.responsible;

        document.getElementById("dueDate").value =
            activity.dueDate;

        document.getElementById("status").value =
            activity.status;

        activityDialog.querySelector("h2").textContent =
            "Editar actividad";

        activityForm.querySelector(
            'button[type="submit"]'
        ).textContent = "Guardar cambios";

        activityDialog.showModal();
    }

    // Eliminar actividad
    function deleteActivity(id) {

        const activity = activities.find(item => item.id === id);

        if (!activity) return;

        const confirmation = confirm(
            `¿Deseas eliminar la actividad "${activity.subject}"?`
        );

        if (!confirmation) return;

        activities = activities.filter(item => item.id !== id);

        saveActivities();
        applyFilter();
    }

    // Guardar nueva actividad o edición
    activityForm.addEventListener("submit", event => {

        event.preventDefault();

        const subject =
            document.getElementById("subject").value.trim();

        const responsible =
            document.getElementById("responsible").value.trim();

        const dueDate =
            document.getElementById("dueDate").value;

        const status =
            document.getElementById("status").value;

        if (!subject || !responsible || !dueDate) {
            alert("Completa todos los campos.");
            return;
        }

        if (editingId !== null) {

            // Actualizar actividad existente
            activities = activities.map(activity => {

                if (activity.id === editingId) {
                    return {
                        ...activity,
                        subject,
                        responsible,
                        dueDate,
                        status
                    };
                }

                return activity;
            });

        } else {

            // Crear actividad nueva
            const newActivity = {
                id: Date.now(),
                subject,
                responsible,
                dueDate,
                status
            };

            activities.push(newActivity);
        }

        saveActivities();

        applyFilter();

        activityForm.reset();

        editingId = null;

        activityDialog.close();
    });

    // Cerrar formulario
    function closeActivityDialog() {
        editingId = null;
        activityDialog.close();
    }

    closeDialog.addEventListener("click", closeActivityDialog);
    cancelBtn.addEventListener("click", closeActivityDialog);

    // Aplicar filtro
    function applyFilter() {

        const search = filterInput.value.toLowerCase().trim();

        const filtered = activities.filter(activity => {

            return (
                activity.subject.toLowerCase().includes(search) ||
                activity.responsible.toLowerCase().includes(search) ||
                activity.status.toLowerCase().includes(search)
            );

        });

        renderActivities(filtered);
    }

    filterInput.addEventListener("input", applyFilter);

    // Carga inicial
    renderActivities(activities);

})();











/* =====================================
   MODULO SOLICITUDES
   Crear - Editar - Eliminar - Filtrar
===================================== */

(() => {

    const body = document.getElementById("requestsBody");
    const filter = document.getElementById("requestFilter");
    const dialog = document.getElementById("requestDialog");
    const form = document.getElementById("requestForm");

    if (!body || !dialog || !form) return;

    const STORAGE_KEY = "abs_requests";

    let requests = [];
    let editingId = null;

    // CARGAR SOLICITUDES
    function loadRequests() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }

            }

        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        }

        return [];
    }

    requests = loadRequests();

    // GUARDAR SOLICITUDES
    function saveRequests() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(requests)
            );

            return true;

        } catch (error) {

            console.error("Error guardando solicitudes:", error);

            alert("No fue posible guardar las solicitudes.");

            return false;
        }
    }

    // RESUMEN DE SOLICITUDES
    function updateSummary() {

        document.getElementById("totalRequests").textContent =
            requests.length;

        document.getElementById("openRequests").textContent =
            requests.filter(r => r.status === "Abierta").length;

        document.getElementById("resolvedRequests").textContent =
            requests.filter(r => r.status === "Resuelta").length;

    }

    // MOSTRAR SOLICITUDES
    function renderRequests(data) {

        body.innerHTML = "";

        document.getElementById("emptyRequests").hidden =
            data.length > 0;

        data.forEach(request => {

            const row = document.createElement("tr");

            function createCell(value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                return cell;
            }

            const subject = createCell(request.subject);
            const requester = createCell(request.requester);

            const dateParts = request.date.split("-");

            const formattedDate =
                `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            const date = createCell(formattedDate);

            // PRIORIDAD
            const priorityCell = document.createElement("td");

            const priority = document.createElement("span");

            const priorityClasses = {
                "Baja": "priority-low",
                "Media": "priority-medium",
                "Alta": "priority-high",
                "Urgente": "priority-urgent"
            };

            priority.className =
                `priority ${priorityClasses[request.priority]}`;

            priority.textContent = request.priority;

            priorityCell.appendChild(priority);

            // ESTADO
            const statusCell = document.createElement("td");

            const status = document.createElement("span");

            const statusClasses = {
                "Abierta": "request-open",
                "En proceso": "request-progress",
                "Resuelta": "request-resolved"
            };

            status.className =
                `request-status ${statusClasses[request.status]}`;

            status.textContent = request.status;

            statusCell.appendChild(status);

            // ACCIONES
            const actionsCell = document.createElement("td");

            const actions = document.createElement("div");

            actions.className = "action-buttons";

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "action-btn edit-btn";
            editButton.textContent = "✏";
            editButton.title = "Editar solicitud";

            editButton.addEventListener("click", () => {
                editRequest(request.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.textContent = "✕";
            deleteButton.title = "Eliminar solicitud";

            deleteButton.addEventListener("click", () => {
                deleteRequest(request.id);
            });

            actions.append(editButton, deleteButton);

            actionsCell.appendChild(actions);

            row.append(
                subject,
                requester,
                date,
                priorityCell,
                statusCell,
                actionsCell
            );

            body.appendChild(row);

        });

        updateSummary();
    }

    // ABRIR FORMULARIO
    function openForm() {

        editingId = null;

        form.reset();

        document.getElementById("requestDialogTitle").textContent =
            "Crear solicitud";

        form.querySelector('button[type="submit"]').textContent =
            "Guardar solicitud";

        dialog.showModal();
    }

    document.getElementById("createRequestBtn")
        .addEventListener("click", openForm);

    // EDITAR SOLICITUD
    function editRequest(id) {

        const request = requests.find(r => r.id === id);

        if (!request) return;

        editingId = id;

        document.getElementById("requestSubject").value =
            request.subject;

        document.getElementById("requester").value =
            request.requester;

        document.getElementById("requestDate").value =
            request.date;

        document.getElementById("requestPriority").value =
            request.priority;

        document.getElementById("requestStatus").value =
            request.status;

        document.getElementById("requestDialogTitle").textContent =
            "Editar solicitud";

        form.querySelector('button[type="submit"]').textContent =
            "Guardar cambios";

        dialog.showModal();
    }

    // ELIMINAR SOLICITUD
    function deleteRequest(id) {

        const request = requests.find(r => r.id === id);

        if (!request) return;

        const confirmation = confirm(
            `¿Deseas eliminar la solicitud "${request.subject}"?`
        );

        if (!confirmation) return;

        const previousRequests = [...requests];

        requests = requests.filter(r => r.id !== id);

        if (saveRequests()) {
            applyFilter();
        } else {
            requests = previousRequests;
            renderRequests(requests);
        }
    }

    // GUARDAR FORMULARIO
    form.addEventListener("submit", event => {

        event.preventDefault();

        const subject =
            document.getElementById("requestSubject").value.trim();

        const requester =
            document.getElementById("requester").value.trim();

        const date =
            document.getElementById("requestDate").value;

        const priority =
            document.getElementById("requestPriority").value;

        const status =
            document.getElementById("requestStatus").value;

        if (!subject || !requester || !date) {
            alert("Completa todos los campos.");
            return;
        }

        const previousRequests = [...requests];

        if (editingId !== null) {

            requests = requests.map(request => {

                if (request.id === editingId) {

                    return {
                        ...request,
                        subject,
                        requester,
                        date,
                        priority,
                        status
                    };

                }

                return request;

            });

        } else {

            requests.push({
                id: Date.now(),
                subject,
                requester,
                date,
                priority,
                status
            });

        }

        if (saveRequests()) {

            editingId = null;

            dialog.close();

            form.reset();

            applyFilter();

        } else {

            requests = previousRequests;
            renderRequests(requests);

        }

    });

    // CERRAR FORMULARIO
    function closeForm() {

        editingId = null;

        dialog.close();

        form.reset();
    }

    document.getElementById("closeRequestDialog")
        .addEventListener("click", closeForm);

    document.getElementById("cancelRequest")
        .addEventListener("click", closeForm);

    // FILTRAR
    function applyFilter() {

        const search = filter.value.toLowerCase().trim();

        const filtered = requests.filter(request => {

            return (
                request.subject.toLowerCase().includes(search) ||
                request.requester.toLowerCase().includes(search) ||
                request.priority.toLowerCase().includes(search) ||
                request.status.toLowerCase().includes(search)
            );

        });

        renderRequests(filtered);
    }

    filter.addEventListener("input", applyFilter);

    // CARGA INICIAL
    renderRequests(requests);

})();





/* =====================================
   MODULO SOLUCIONES
   Crear - Editar - Eliminar - Filtrar
===================================== */

(() => {

    const body = document.getElementById("solutionsBody");
    const filter = document.getElementById("solutionFilter");
    const dialog = document.getElementById("solutionDialog");
    const form = document.getElementById("solutionForm");
    const createBtn = document.getElementById("createSolutionBtn");
    const emptyMessage = document.getElementById("emptySolutions");

    if (!body || !filter || !dialog || !form || !createBtn) {
        console.error("No se encontraron todos los elementos de Soluciones.");
        return;
    }

    const STORAGE_KEY = "abs_solutions";

    let solutions = [];
    let editingId = null;

    // CARGAR SOLUCIONES
    function loadSolutions() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    return parsed;
                }

            }

        } catch (error) {
            console.error("Error cargando soluciones:", error);
        }

        return [];
    }

    solutions = loadSolutions();

    // GUARDAR SOLUCIONES
    function saveSolutions() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(solutions)
            );

            return true;

        } catch (error) {

            console.error("Error guardando soluciones:", error);

            alert("No fue posible guardar las soluciones.");

            return false;
        }
    }

    // MOSTRAR SOLUCIONES
    function renderSolutions(data) {

        body.innerHTML = "";

        if (emptyMessage) {
            emptyMessage.hidden = data.length > 0;
        }

        data.forEach(solution => {

            const row = document.createElement("tr");

            function createCell(value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                return cell;
            }

            const title = createCell(solution.title);
            const description = createCell(solution.description);
            const responsible = createCell(solution.responsible);

            const dateParts = solution.date.split("-");

            const formattedDate =
                `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            const date = createCell(formattedDate);

            // ESTADO
            const statusCell = document.createElement("td");

            const status = document.createElement("span");

            const statusClasses = {
                "Pendiente": "status-pending",
                "En proceso": "request-progress",
                "Resuelta": "request-resolved"
            };

            status.className =
                `status ${statusClasses[solution.status]}`;

            status.textContent = solution.status;

            statusCell.appendChild(status);

            // ACCIONES
            const actionsCell = document.createElement("td");

            const actions = document.createElement("div");

            actions.className = "action-buttons";

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "action-btn edit-btn";
            editButton.textContent = "✏";
            editButton.title = "Editar solución";

            editButton.addEventListener("click", () => {
                editSolution(solution.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.textContent = "✕";
            deleteButton.title = "Eliminar solución";

            deleteButton.addEventListener("click", () => {
                deleteSolution(solution.id);
            });

            actions.append(editButton, deleteButton);

            actionsCell.appendChild(actions);

            row.append(
                title,
                description,
                responsible,
                date,
                statusCell,
                actionsCell
            );

            body.appendChild(row);

        });
    }

    // ABRIR FORMULARIO
    function openForm() {

        editingId = null;

        form.reset();

        document.getElementById("solutionDialogTitle").textContent =
            "Crear solución";

        form.querySelector('button[type="submit"]').textContent =
            "Guardar solución";

        dialog.showModal();
    }

    createBtn.addEventListener("click", openForm);

    // EDITAR SOLUCION
    function editSolution(id) {

        const solution = solutions.find(item => item.id === id);

        if (!solution) return;

        editingId = id;

        document.getElementById("solutionTitle").value =
            solution.title;

        document.getElementById("solutionDescription").value =
            solution.description;

        document.getElementById("solutionResponsible").value =
            solution.responsible;

        document.getElementById("solutionDate").value =
            solution.date;

        document.getElementById("solutionStatus").value =
            solution.status;

        document.getElementById("solutionDialogTitle").textContent =
            "Editar solución";

        form.querySelector('button[type="submit"]').textContent =
            "Guardar cambios";

        dialog.showModal();
    }

    // ELIMINAR SOLUCION
    function deleteSolution(id) {

        const solution = solutions.find(item => item.id === id);

        if (!solution) return;

        const confirmation = confirm(
            `¿Deseas eliminar la solución "${solution.title}"?`
        );

        if (!confirmation) return;

        const previousSolutions = [...solutions];

        solutions = solutions.filter(item => item.id !== id);

        if (saveSolutions()) {
            applyFilter();
        } else {
            solutions = previousSolutions;
            renderSolutions(solutions);
        }
    }

    // GUARDAR FORMULARIO
    form.addEventListener("submit", event => {

        event.preventDefault();

        const title =
            document.getElementById("solutionTitle").value.trim();

        const description =
            document.getElementById("solutionDescription").value.trim();

        const responsible =
            document.getElementById("solutionResponsible").value.trim();

        const date =
            document.getElementById("solutionDate").value;

        const status =
            document.getElementById("solutionStatus").value;

        if (!title || !description || !responsible || !date) {
            alert("Completa todos los campos.");
            return;
        }

        const previousSolutions = [...solutions];

        if (editingId !== null) {

            solutions = solutions.map(solution => {

                if (solution.id === editingId) {

                    return {
                        ...solution,
                        title,
                        description,
                        responsible,
                        date,
                        status
                    };

                }

                return solution;

            });

        } else {

            solutions.push({
                id: Date.now(),
                title,
                description,
                responsible,
                date,
                status
            });

        }

        if (saveSolutions()) {

            editingId = null;

            dialog.close();

            form.reset();

            applyFilter();

        } else {

            solutions = previousSolutions;
            renderSolutions(solutions);

        }

    });

    // CERRAR FORMULARIO
    function closeForm() {

        editingId = null;

        dialog.close();

        form.reset();
    }

    document.getElementById("closeSolutionDialog")
        .addEventListener("click", closeForm);

    document.getElementById("cancelSolution")
        .addEventListener("click", closeForm);

    // FILTRAR SOLUCIONES
    function applyFilter() {

        const search = filter.value.toLowerCase().trim();

        const filtered = solutions.filter(solution => {

            return (
                solution.title.toLowerCase().includes(search) ||
                solution.description.toLowerCase().includes(search) ||
                solution.responsible.toLowerCase().includes(search) ||
                solution.status.toLowerCase().includes(search)
            );

        });

        renderSolutions(filtered);
    }

    filter.addEventListener("input", applyFilter);

    // CARGA INICIAL
    renderSolutions(solutions);

})();


// =====================================
// 6. MODULO INFORMES
// =====================================

(() => {

    // ELEMENTOS HTML
    const reportActivities = document.getElementById("reportActivities");
    const reportRequests = document.getElementById("reportRequests");
    const reportSolutions = document.getElementById("reportSolutions");
    const reportSummaryBody = document.getElementById("reportSummaryBody");


    // LEER DATOS GUARDADOS EN LOCALSTORAGE
    function getStoredData(key) {

        try {
            const data = JSON.parse(localStorage.getItem(key)) || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }

    }


    // ACTUALIZAR INFORMES
    function actualizarInformes() {

        const activities = getStoredData("abs_activities");
        const requests = getStoredData("abs_requests");
        const solutions = getStoredData("abs_solutions");


        // ACTUALIZAR TARJETAS
        reportActivities.textContent = activities.length;
        reportRequests.textContent = requests.length;
        reportSolutions.textContent = solutions.length;


        // CONTAR ESTADOS DE ACTIVIDADES
        const activityPending = activities.filter(
            item => item.status === "Pendiente"
        ).length;

        const activityProgress = 0;

        const activityCompleted = activities.filter(
            item => item.status === "Completada"
        ).length;


        // CONTAR ESTADOS DE SOLICITUDES
        const requestPending = requests.filter(
            item => item.status === "Abierta"
        ).length;

        const requestProgress = requests.filter(
            item => item.status === "En proceso"
        ).length;

        const requestCompleted = requests.filter(
            item => item.status === "Resuelta"
        ).length;


        // CONTAR ESTADOS DE SOLUCIONES
        const solutionPending = solutions.filter(
            item => item.status === "Pendiente"
        ).length;

        const solutionProgress = solutions.filter(
            item => item.status === "En proceso"
        ).length;

        const solutionCompleted = solutions.filter(
            item => item.status === "Resuelta"
        ).length;


        // CONSTRUIR TABLA DE INFORMES
        reportSummaryBody.innerHTML = `

            <tr>
                <td>Actividades</td>
                <td>${activityPending}</td>
                <td>${activityProgress}</td>
                <td>${activityCompleted}</td>
                <td>${activities.length}</td>
            </tr>

            <tr>
                <td>Solicitudes</td>
                <td>${requestPending}</td>
                <td>${requestProgress}</td>
                <td>${requestCompleted}</td>
                <td>${requests.length}</td>
            </tr>

            <tr>
                <td>Soluciones</td>
                <td>${solutionPending}</td>
                <td>${solutionProgress}</td>
                <td>${solutionCompleted}</td>
                <td>${solutions.length}</td>
            </tr>

        `;

    }


    // PERMITIR QUE NAVEGACION ACTUALICE LOS INFORMES
    window.actualizarInformes = actualizarInformes;


})();




/* =====================================
   NAVEGACION ENTRE ACTIVIDADES
   Y SOLICITUDES
===================================== */


(() => {

    const modules = {
        inicio: document.getElementById("moduleInicio"),
        actividades: document.getElementById("moduleActividades"),
        solicitudes: document.getElementById("moduleSolicitudes"),
        soluciones: document.getElementById("moduleSoluciones"),
        informes: document.getElementById("moduleInformes")
    };

    const links = document.querySelectorAll(".main-menu a");

    function showModule(moduleName) {

        Object.entries(modules).forEach(([name, module]) => {

            if (module) {
                module.hidden = name !== moduleName;
            }

        });

        links.forEach(link => {

            const selected =
                link.getAttribute("href") === `#${moduleName}`;

            const item = link.closest("li");

            if (item) {
                item.classList.toggle("tab-select", selected);
            }

            if (selected) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }

        });

        if (moduleName === "informes") {
             window.actualizarInformes();
        }

    }

    links.forEach(link => {

        link.addEventListener("click", event => {

            const moduleName =
                link.getAttribute("href").substring(1);

            if (!modules[moduleName]) return;

            event.preventDefault();

            history.pushState(null, "", `#${moduleName}`);

            showModule(moduleName);

            closeMenu()

        });

    });

    window.addEventListener("popstate", () => {

        const moduleName = location.hash.substring(1) || "inicio";

        showModule(
            modules[moduleName] ? moduleName : "inicio"
        );

    });

    const initialModule = location.hash.substring(1) || "inicio";
    showModule(
        modules[initialModule] ? initialModule : "inicio"
    );

})();