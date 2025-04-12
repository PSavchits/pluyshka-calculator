import {openDB} from 'idb';

const DB_NAME = 'students-db';
const STUDENT_STORE = 'students';
const SANDBOX_STORE = 'sandbox';

export const initDB = async () => {
    return openDB(DB_NAME, 2, {
        upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains(STUDENT_STORE)) {
                const store = db.createObjectStore(STUDENT_STORE, {keyPath: 'id', autoIncrement: true});
                store.createIndex('groupName', 'groupName');
                store.createIndex('fullName', 'fullName');
            }
            if (oldVersion < 2 && !db.objectStoreNames.contains(SANDBOX_STORE)) {
                db.createObjectStore(SANDBOX_STORE, {keyPath: 'id'});
            }
        },
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

export const updateStudentEvaluation = async (id, firstDigit, secondDigit, thirdDigit, form) => {
    const db = await initDB();
    const tx = db.transaction(STUDENT_STORE, 'readwrite');
    const store = tx.objectStore(STUDENT_STORE);
    const student = await store.get(id);
    if (!student) return;

    let result = 0;
    switch (form) {
        case 'Дневная':
            result = Number(firstDigit) + Number(secondDigit) + Number(thirdDigit || 0);
            break;
        case 'ДО':
            result = Number(firstDigit) + Number(secondDigit) - 1;
            break;
    }

    const updated = {
        ...student,
        form,
        firstDigit,
        secondDigit,
        thirdDigit,
        result,
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

export const saveSandboxParams = async (params) => {
    const db = await initDB();
    const tx = db.transaction(SANDBOX_STORE, 'readwrite');
    const store = tx.objectStore(SANDBOX_STORE);
    await store.put({...params, id: 'sandbox_params'});
    await tx.done;
};

export const getSandboxParams = async () => {
    const db = await initDB();
    const tx = db.transaction(SANDBOX_STORE, 'readonly');
    const store = tx.objectStore(SANDBOX_STORE);
    return await store.get('sandbox_params') || {
        firstDigit: '',
        secondDigit: '',
        thirdDigit: '',
        form: 'Дневная',
        result: null
    };
};

