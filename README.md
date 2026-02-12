# Plataforma de Guardado de Tarjetas con Google Pay

Plataforma web para facilitar el guardado de tarjetas de crédito/débito en Google Pay, activando el popup nativo de Android.

## 🚀 Características

- ✅ Formulario simplificado (solo número de tarjeta y fecha de vencimiento)
- ✅ Integración con Google Pay API
- ✅ Popup nativo de Android para guardar tarjetas
- ✅ Diseño moderno con modo oscuro
- ✅ Campos opcionales (no obligatorios)
- ✅ No almacena CVV por seguridad

## 📋 Requisitos

- Node.js 14.x o superior (solo para desarrollo local)

## 🛠️ Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/hoshoria/testgpay.git
cd testgpay
```

2. Inicia el servidor local:
```bash
node server.js
```

3. Abre tu navegador en `http://localhost:8080`

## 🌐 Despliegue en Vercel

Este proyecto está listo para desplegarse en Vercel:

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente la configuración
3. El despliegue se realizará automáticamente

O usa la CLI de Vercel:
```bash
npm i -g vercel
vercel
```

## 📱 Uso

1. Ingresa el número de tarjeta (opcional)
2. Ingresa la fecha de vencimiento (opcional)
3. Haz clic en "Guardar en Google Pay"
4. Se activará el popup nativo de Android para confirmar el guardado

## 🔒 Seguridad

- No se almacena información sensible como CVV
- Los datos se procesan a través de la API oficial de Google Pay
- Conexión segura SSL/TLS

## 📝 Notas

- El popup nativo de Google Pay solo funciona en dispositivos Android con Google Pay configurado
- Los campos son opcionales para facilitar el proceso
- La validación se realiza solo si se ingresa información

## 👨‍💻 Créditos

Creado para Unknown Cards

