let DB;
// Selectores de interfaz
const form = document.querySelector('form'),
      nombre = document.querySelector('#nombre'),
      telefono = document.querySelector('#telefono'),
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      tratamiento = document.querySelector('#tratamiento'),
      turnos = document.querySelector('#turnos'),
      headingAdministra = document.querySelector('#administra');

document.addEventListener('DOMContentLoaded', () =>{
 // Para crear la DB
 let crearDB = window.indexedDB.open('turnos', 1);

// Para ver si hay error o funciona la creacion de DB
 crearDB.onerror = function() {
  //console.log('Hubo un error');
 }
 crearDB.onsuccess = function() {
   //console.log('Todo ok');

   DB = crearDB.result;
   //console.log(DB);
   mostrarTurnos();
 }

 crearDB.onupgradeneeded = function(e) {
   let db = e.target.result;

   let objectStore = db.createObjectStore('turnos', { keyPath:'key', autoIncrement: true } );

   objectStore.createIndex('nombre', 'nombre', { unique : false });
   objectStore.createIndex('telefono', 'telefono', { unique : false });
   objectStore.createIndex('fecha', 'fecha', { unique : false });
   objectStore.createIndex('hora', 'hora', { unique : false });
   objectStore.createIndex('tratamiento', 'tratamiento', { unique : false });

   console.log('Base de datos ok');
 }
 form.addEventListener('submit', agregarDatos);

 function agregarDatos(e) {
      e.preventDefault();

      const nuevoTurno = {
            nombre: nombre.value,
            telefono: telefono.value,
            fecha: fecha.value,
            hora: hora.value,
            tratamiento: tratamiento.value
      }
        //console.log(nuevoTurno);

      let transaction = DB.transaction(['turnos'], 'readwrite');
      let objectStore = transaction.objectStore('turnos');
      //console.log(objectStore); 
      let pedido = objectStore.add(nuevoTurno);

      //console.log(pedido);

      pedido.onsuccess =() => {
           form.reset();
      }
      transaction.oncomplete = () => {
      //  console.log('turno ok');
        mostrarTurnos();
      }
      transaction.onerror = () => {
       // console.log('error en turno');
      }

     }

     function mostrarTurnos() {

       while(turnos.firstChild) {
             turnos.removeChild(turnos.firstChild);
       }
       // trabajando con objectStore
       let objectStore = DB.transaction('turnos').objectStore('turnos');

       objectStore.openCursor().onsuccess = function(e) {
    
       let cursor = e.target.result;

          if(cursor) {
             let turnoHTML = document.createElement('li');
             turnoHTML.setAttribute('data-turno-id', cursor.value.key);
             turnoHTML.classList.add('list-group-item');
             
             turnoHTML.innerHTML = `
                  <p class="font-weight-bold">Nombre: <span class="font-weight-normal">${cursor.value.nombre}</span></p>
                  <p class="font-weight-bold">Teléfono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                  <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                  <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                  <p class="font-weight-bold">Tratamiento: <span class="font-weight-normal">${cursor.value.tratamiento}</span></p>
                  `;

              const botonBorrar = document.createElement('button');
              botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
              botonBorrar.innerHTML = '<span aria-hidden="true"></span> Borrar';
              botonBorrar.onclick = borrarTurno;
              turnoHTML.appendChild(botonBorrar);
                  
              turnos.appendChild(turnoHTML);

              cursor.continue();
          } else {
              if(!turnos.firstChild){
                // En caso de no haber turnos nuevos 
            headingAdministra.textContent = 'Turnos solicitados';
            let listado = document.createElement('p');
            listado.classList.add('text-center');
            listado.textContent = 'No hay turnos solicitados';
            turnos.appendChild(listado);
          } else {
             headingAdministra.textContent = 'Tus turnos solicitados';
            }

          }
       } 
     }
     function borrarTurno(e) {
       let turnoID = Number(e.target.parentElement.getAttribute('data-turno-id'));

       let transaction = DB.transaction(['turnos'], 'readwrite');
       let objectStore = transaction.objectStore('turnos');
       let pedido = objectStore.delete(turnoID);
 
       transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log('borrando turno con el id: ${turnoID}');
           
            if(!turnos.firstChild){
              // En caso de no haber turnos nuevos 
          headingAdministra.textContent = 'Turnos solicitados';
          let listado = document.createElement('p');
          listado.classList.add('text-center');
          listado.textContent = 'No hay turnos solicitados';
          turnos.appendChild(listado);
        } else {
           headingAdministra.textContent = 'Tus turnos solicitados';
          }
       }
     }

})