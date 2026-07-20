# Registro Civil de Mascotas

Aplicación desarrollada como examen final del programa Desarrollo de Aplicaciones Full Stack JavaScript.

## Objetivo de la aplicación

El objetivo del proyecto es implementar un sistema de Registro Civil de Mascotas que permita almacenar y administrar el nombre de una mascota junto con el RUT de su dueño.

La información se guarda de manera persistente en un archivo en formato JSON.

## Funcionalidades

* Registrar una mascota nueva.
* Mostrar todas las mascotas registradas.
* Buscar una mascota por su nombre.
* Buscar todas las mascotas asociadas a un RUT.
* Eliminar una mascota por su nombre.
* Eliminar todas las mascotas asociadas a un RUT.
* Consumir el servidor web mediante Axios.
* Capturar y mostrar errores de validación, búsqueda y conexión.

## Tecnologías utilizadas

* Node.js
* Express
* Axios
* JavaScript
* HTML5
* CSS3
* JSON

## Instalación

Clonar o descargar el repositorio.

Instalar las dependencias:

`npm install`

Iniciar el servidor:

`npm start`

Abrir la aplicación en el navegador:

`http://localhost:3000`

## Endpoints

### Consultar todas las mascotas

`GET /api/mascotas`

### Buscar una mascota por nombre

`GET /api/mascotas?nombre=Luna`

### Buscar mascotas por RUT

`GET /api/mascotas?rut=12.345.678-9`

### Registrar una mascota

`POST /api/mascotas`

Ejemplo del cuerpo de la solicitud:

```json
{
  "nombre": "Luna",
  "rut": "12.345.678-9"
}
```

### Eliminar una mascota por nombre

`DELETE /api/mascotas?nombre=Luna`

### Eliminar mascotas por RUT

`DELETE /api/mascotas?rut=12.345.678-9`

## Estructura del proyecto

```text
registro-mascotas/
├── data/
│   └── mascotas.json
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Autor

Kevin Humberto Alejandro Retamal Espinoza

## Repositorio GitHub

https://github.com/Kretamale/registro-mascotas.git

