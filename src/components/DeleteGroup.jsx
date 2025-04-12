import React, {useEffect, useState} from 'react';
import {getAllGroups, deleteGroup} from '../utils/db';

const DeleteGroup = () => {
    const [group, setGroup] = React.useState('');
    const [groups, setGroups] = React.useState([]);

    React.useEffect(() => {
        const fetchGroups = async () => {
            const allGroups = await getAllGroups();
            setGroups(allGroups);
        };
        fetchGroups();
    }, []);

    const handleDelete = async () => {
        if (!group) {
            alert('Введите или выберите группу для удаления');
            return;
        }
        const confirmed = window.confirm(`Удалить всех учащихся из группы "${group}"? Это действие необратимо.`);
        if (!confirmed) return;
        const count = await deleteGroup(group);
        alert(`Удалено ${count} учащихся из группы "${group}"`);
        setGroup('');
        const updatedGroups = await getAllGroups();
        setGroups(updatedGroups);
    };

    return (
        <div>
            <h3>Удаление группы</h3>
            <input
                type="text"
                list="group-options-delete"
                placeholder="Введите или выберите группу"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
            />
            <datalist id="group-options-delete">
                {groups.map((g, i) => (
                    <option key={i} value={g}/>
                ))}
            </datalist>
            <button onClick={handleDelete}> Удалить группу</button>
        </div>
    );
};

export default DeleteGroup;