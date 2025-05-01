import React, { useEffect, useState } from 'react';
import { getAllGroups, deleteGroup } from '../utils/db';
import '../styles/upload.css'
import '../styles/delete.css'

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <h4 className="modal-title">{title}</h4>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button
                        className="modal-button confirm-button"
                        onClick={onConfirm}
                    >
                        Подтвердить
                    </button>
                    <button
                        className="modal-button cancel-button"
                        onClick={onCancel}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteGroup = () => {
    const [group, setGroup] = useState('');
    const [groups, setGroups] = useState([]);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const allGroups = await getAllGroups();
                setGroups(allGroups);
            } catch (error) {
                setNotification({
                    type: 'error',
                    title: 'Ошибка загрузки',
                    content: 'Не удалось загрузить список групп'
                });
            }
        };
        fetchGroups();
    }, []);

    const handleDeleteConfirm = async () => {
        setShowConfirmModal(false);

        try {
            const count = await deleteGroup(group);
            setNotification({
                type: 'success',
                title: 'Группа удалена',
                content: `Удалено ${count} учащихся из группы "${group}"`
            });

            setGroup('');
            const updatedGroups = await getAllGroups();
            setGroups(updatedGroups);

            setTimeout(() => setNotification(null), 4000);
        } catch (error) {
            setNotification({
                type: 'error',
                title: 'Ошибка удаления',
                content: error.message || 'Не удалось удалить группу'
            });
        }
    };

    return (
        <div className="delete-group-wrapper">
            <h3>Удаление группы</h3>

            <div className="input-group">
                <input
                    type="text"
                    list="group-options-delete"
                    placeholder="Введите или выберите группу"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                />
                <datalist id="group-options-delete">
                    {groups.map((g, i) => (
                        <option key={i} value={g} />
                    ))}
                </datalist>
            </div>

            <button
                className="danger-button"
                onClick={() => group && setShowConfirmModal(true)}
                disabled={!group}
            >
                Удалить группу
            </button>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowConfirmModal(false)}
                title="Подтверждение удаления"
                message={`Вы точно хотите удалить всех учащихся из группы "${group}"? Это действие невозможно отменить.`}
            />
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        {notification.type === 'success' ? '✓' : '⚠'}
                    </div>
                    <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.content}</p>
                    </div>
                    <button
                        className="notification-close"
                        onClick={() => setNotification(null)}
                        aria-label="Закрыть уведомление"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeleteGroup;