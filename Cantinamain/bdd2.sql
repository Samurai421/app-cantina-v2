-- Crear la base de datos
CREATE DATABASE MiTiendaAvanzada;
USE MiTiendaAvanzada;

-- Crear tabla productos con más detalles y control de fechas
CREATE TABLE Productos (
    ProductoID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion TEXT,
    Precio DECIMAL(10, 2) NOT NULL CHECK (Precio >= 0),
    Stock INT NOT NULL CHECK (Stock >= 0),
    Categoria VARCHAR(100),
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

-- Crear tabla usuarios con validaciones y control de creación y último acceso
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY AUTO_INCREMENT,
    Correo VARCHAR(255) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
    Rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UltimoAcceso TIMESTAMP,
    Estado ENUM('activo', 'suspendido', 'eliminado') DEFAULT 'activo'
);

-- Índice para optimizar búsqueda por correo
CREATE INDEX idx_usuario_correo ON Usuarios(Correo);
