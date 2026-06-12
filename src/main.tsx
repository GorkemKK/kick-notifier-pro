import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import NotificationToast from './components/NotificationToast.tsx'

const isNotification = window.location.hash === '#/notification';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {isNotification ? <NotificationToast /> : <App />}
    </React.StrictMode>,
)
