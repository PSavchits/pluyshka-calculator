import {openDB} from 'idb';

const DB_NAME = 'students-db';
const STUDENT_STORE = 'students';
const SANDBOX_STORE = 'sandbox';

export const initDB = async () => {
    return openDB(DB_NAME, 5, {
        upgrade(db) {
            if (db.objectStoreNames.contains(STUDENT_STORE)) {
                db.deleteObjectStore(STUDENT_STORE);
            }
            if (db.objectStoreNames.contains(SANDBOX_STORE)) {
                db.deleteObjectStore(SANDBOX_STORE);
            }

            const studentStore = db.createObjectStore(STUDENT_STORE, {
                keyPath: 'id',
                autoIncrement: true
            });
            studentStore.createIndex('groupName', 'groupName');
            studentStore.createIndex('fullName', 'fullName');
            studentStore.createIndex('finalMark', 'finalMark');

            db.createObjectStore(SANDBOX_STORE, {keyPath: 'id'});
        }
    });
};

export const saveStudents = async (students) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readwrite');
    const store = tx.objectStore(STUDENT_STORE);
    for (const student of students) {
        await store.add(student);
    }
    await tx.done;
};

export const getStudentsBySearch = async (groupName, fullNamePrefix) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE);
    const store = tx.objectStore(STUDENT_STORE);
    const all = await store.getAll();
    return all.filter(
        (student) =>
            student.groupName.toLowerCase() === groupName.toLowerCase() &&
            student.fullName.toLowerCase().startsWith(fullNamePrefix.toLowerCase())
    );
};

export const updateStudentEvaluation = async (id, evaluationData) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readwrite');
    const store = tx.objectStore(STUDENT_STORE);
    const student = await store.get(id);
    if (!student) return;

    const updated = {
        ...student,
        ...evaluationData,
        lastUpdated: new Date().toISOString()
    };

    await store.put(updated);
    await tx.done;
    return updated;
};

export const getAllGroups = async () => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readonly');
    const store = tx.objectStore(STUDENT_STORE);
    const all = await store.getAll();
    const groupSet = new Set(all.map(s => s.groupName).filter(Boolean));
    return Array.from(groupSet).sort();
};

export const getStudentsByGroup = async (groupName) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readonly');
    const store = tx.objectStore(STUDENT_STORE);
    const all = await store.getAll();
    return all.filter(s => s.groupName === groupName);
};

export const deleteGroup = async (groupName) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readwrite');
    const store = tx.objectStore(STUDENT_STORE);
    const all = await store.getAll();
    const idsToDelete = all
        .filter((s) => s.groupName === groupName)
        .map((s) => s.id);
    for (const id of idsToDelete) {
        await store.delete(id);
    }
    return idsToDelete.length;
};