const StudentModule = (() => {

    let students = [];

    const elements = {
        form: document.querySelector("#studentForm"),
        nombre: document.querySelector("#nombre"),
        apellido: document.querySelector("#apellido"),
        email: document.querySelector("#email"),
        edad: document.querySelector("#edad"),
        carrera: document.querySelector("#carrera"),
        tablaBody: document.querySelector("#tablaBody"),
        limpiarBtn: document.querySelector("#limpiarBtn"),
        borrarTodo: document.querySelector("#borrarTodo")
    };

    const init = () => {
        elements.form.addEventListener("submit", agregarEstudiante);
        elements.limpiarBtn.addEventListener("click", limpiarFormulario);
        elements.borrarTodo.addEventListener("click", borrarTodo);
        render();
    };

    const agregarEstudiante = (e) => {
        e.preventDefault();

        if (!elements.nombre.value || !elements.apellido.value || !elements.email.value) {
            alert("Los campos con * son obligatorios");
            return;
        }

        const data = {
            nombre: elements.nombre.value,
            apellido: elements.apellido.value,
            email: elements.email.value,
            edad: elements.edad.value || "-",
            carrera: elements.carrera.value
        };

        students.push(data);
        limpiarFormulario();
        render();
    };

    const limpiarFormulario = () => {
        elements.form.reset();
    };

    const borrarTodo = () => {
        students = [];
        render();
    };

    const eliminar = (index) => {
        students.splice(index, 1);
        render();
    };

    const render = () => {
        elements.tablaBody.innerHTML = "";

        students.forEach((s, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${s.nombre}</td>
                    <td>${s.apellido}</td>
                    <td>${s.email}</td>
                    <td>${s.edad}</td>
                    <td>${s.carrera}</td>
                    <td><button onclick="StudentModule.eliminar(${index})">Eliminar</button></td>
                </tr>`;
            elements.tablaBody.innerHTML += row;
        });
    };

    return { init, eliminar };

})();

window.onload = StudentModule.init;
