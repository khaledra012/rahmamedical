import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, Edit3, KeyRound, RefreshCw } from 'lucide-react';
import { Alert, Badge, Button, Input, Modal, Table } from '../../components';
import { usersService } from '../../services/usersService';
import './Users.css';

const emptyForm = { name: '', username: '', email: '', password: '', role: 'operator', isActive: true };

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await usersService.getUsers());
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'تعذر تحميل المستخدمين' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openCreate = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setModalMode('create');
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({ name: user.name, username: user.username || '', email: user.email, role: user.role, isActive: user.isActive });
    setModalMode('edit');
  };

  const openReset = (user) => {
    setSelectedUser(user);
    setForm({ password: '' });
    setModalMode('reset');
  };

  const closeModal = () => {
    if (saving) return;
    setModalMode(null);
    setSelectedUser(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await usersService.createUser(form);
        setFeedback({ type: 'success', message: 'تم إنشاء الحساب. سيُطلب من المستخدم تغيير كلمة المرور عند أول دخول.' });
      } else if (modalMode === 'edit') {
        const { name, username, email, role, isActive } = form;
        const updatePayload = selectedUser.role === 'admin'
          ? { name, username, email }
          : { name, username, email, role, isActive };
        await usersService.updateUser(selectedUser.id, updatePayload);
        setFeedback({ type: 'success', message: 'تم تحديث بيانات المستخدم.' });
      } else {
        await usersService.resetPassword(selectedUser.id, form.password);
        setFeedback({ type: 'success', message: 'تم تعيين كلمة المرور المؤقتة الجديدة.' });
      }
      closeModal();
      await loadUsers();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'تعذر حفظ بيانات المستخدم' });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'المستخدم', key: 'name', render: (_, row) => <div><strong>{row.name}</strong><div className="users-muted">@{row.username || '—'}</div></div> },
    { header: 'البريد الإلكتروني', key: 'email' },
    { header: 'الدور', key: 'role', render: (role) => <Badge variant={role === 'admin' ? 'info' : role === 'operator' ? 'success' : 'neutral'}>{role === 'admin' ? 'مدير النظام' : role === 'operator' ? 'موظف تشغيل' : 'مشاهدة فقط'}</Badge> },
    { header: 'الحالة', key: 'isActive', render: (active) => <Badge variant={active ? 'success' : 'danger'} dot>{active ? 'نشط' : 'موقوف'}</Badge> },
    { header: 'آخر دخول', key: 'lastLogin', render: (value) => value ? new Date(value).toLocaleString('ar-EG') : 'لم يدخل بعد' },
    { header: 'إجراءات', key: 'actions', render: (_, row) => <div className="users-actions"><Button size="sm" variant="outline" icon={<Edit3 size={14} />} onClick={() => openEdit(row)}>تعديل</Button><Button size="sm" variant="secondary" icon={<KeyRound size={14} />} onClick={() => openReset(row)}>كلمة المرور</Button></div> },
  ];

  return (
    <div className="users-page">
      <div className="users-header">
        <div><h2>إدارة المستخدمين والصلاحيات</h2><p>إنشاء حسابات موظفي التشغيل والمشاهدة وتعطيلها عند الحاجة.</p></div>
        <div className="users-actions"><Button variant="outline" icon={<RefreshCw size={16} />} onClick={loadUsers}>تحديث</Button><Button icon={<UserPlus size={16} />} onClick={openCreate}>إضافة مستخدم</Button></div>
      </div>
      {feedback && <Alert variant={feedback.type} onClose={() => setFeedback(null)}>{feedback.message}</Alert>}
      <div className="users-table-card"><Table columns={columns} data={users} isLoading={loading} emptyMessage="لا توجد حسابات بعد" /></div>

      <Modal isOpen={Boolean(modalMode)} onClose={closeModal} title={modalMode === 'create' ? 'إضافة مستخدم' : modalMode === 'edit' ? 'تعديل المستخدم' : 'تعيين كلمة مرور مؤقتة'} size="md">
        <form className="users-form" onSubmit={submit}>
          {modalMode !== 'reset' ? <>
            <Input label="الاسم" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="اسم المستخدم" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} required helperText="حروف إنجليزية وأرقام ونقطة أو شرطة" />
            <Input label="البريد الإلكتروني" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {modalMode === 'create' && <Input label="كلمة المرور المؤقتة" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required />}
            {form.role !== 'admin' && <label className="users-field">الدور<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="operator">موظف تشغيل</option><option value="viewer">مشاهدة فقط</option></select></label>}
            {modalMode === 'edit' && form.role !== 'admin' && <label className="users-checkbox"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> الحساب نشط</label>}
          </> : <Input label="كلمة المرور المؤقتة الجديدة" type="password" value={form.password || ''} onChange={(e) => setForm({ password: e.target.value })} required />}
          <div className="users-modal-actions"><Button variant="outline" onClick={closeModal} disabled={saving}>إلغاء</Button><Button type="submit" isLoading={saving}>حفظ</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
