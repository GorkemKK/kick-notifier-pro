import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import NotificationToast from './components/NotificationToast.tsx'

const hash = window.location.hash;
const searchParams = new URLSearchParams(window.location.search);
const isNotification = hash === '#/notification' || hash === '#notification' || searchParams.get('mode') === 'notification';

if (isNotification) {
    document.body.style.backgroundColor = 'transparent';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {isNotification ? <NotificationToast /> : <App />}
    </React.StrictMode>,
)
