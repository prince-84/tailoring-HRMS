'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Check, Save } from 'lucide-react';
import Badge from '@/components/common/Badge';
import api from '@/lib/api';
import { showToast, successAlert } from '@/lib/swal';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, any[]>>({});
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([api.get('/roles'), api.get('/permissions')]);
      const fetchedRoles = rolesRes.data.data || [];
      setRoles(fetchedRoles);
      setPermissionsByModule(permsRes.data.data || {});

      if (fetchedRoles.length > 0) {
        const initialRole = fetchedRoles[0];
        setSelectedRole(initialRole);
        setSelectedPermIds(initialRole.permissions?.map((p: any) => p.id) || []);
      }
    } catch {
      showToast('Could not load roles and permissions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions?.map((p: any) => p.id) || []);
  };

  const togglePermission = (permId: number) => {
    if (selectedRole?.slug === 'super-admin') return; // Super admin has everything

    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await api.put(`/roles/${selectedRole.id}/permissions`, {
        permission_ids: selectedPermIds,
      });
      successAlert('Permissions Updated', `Permissions for role '${selectedRole.name}' saved successfully.`);
      fetchData();
    } catch {
      showToast('Could not update role permissions', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Roles & Permissions Matrix</h2>
          <p className="text-xs text-[#68708A]">
            Granular action-level access control (View, Create, Edit, Delete, Approve, Export) across 13 modules.
          </p>
        </div>

        <button
          onClick={handleSaveMatrix}
          disabled={isSaving || selectedRole?.slug === 'super-admin'}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Permission Matrix</span>
            </>
          )}
        </button>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSelectRole(r)}
            className={`p-4 rounded-xl text-left border transition flex flex-col justify-between ${
              selectedRole?.id === r.id
                ? 'bg-[#152244] text-white border-[#152244] shadow-md'
                : 'bg-white text-[#18213A] border-[#E6E9F0] hover:bg-[#F2F4F8]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{r.name}</span>
                {r.slug === 'super-admin' && <ShieldCheck className="w-4 h-4 text-[#B8862E]" />}
              </div>
              <p
                className={`text-[10px] mt-1 line-clamp-2 ${
                  selectedRole?.id === r.id ? 'text-[#9AA1B5]' : 'text-[#68708A]'
                }`}
              >
                {r.description}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono mt-3 font-semibold ${
                selectedRole?.id === r.id ? 'text-[#B8862E]' : 'text-[#9AA1B5]'
              }`}
            >
              {r.users_count || 0} Assigned Users
            </span>
          </button>
        ))}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#E6E9F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E9F0] flex items-center justify-between bg-gradient-to-r from-white to-[#F2F4F8]">
          <div>
            <h3 className="font-display font-bold text-base text-[#18213A]">
              Permission Matrix for: <span className="text-[#B8862E]">{selectedRole?.name}</span>
            </h3>
            <p className="text-xs text-[#68708A] mt-0.5">
              {selectedRole?.slug === 'super-admin'
                ? 'Super Admin has all permissions unconditionally.'
                : 'Toggle checkboxes below to grant or revoke specific actions.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F4F8] text-[#68708A] text-[11px] font-bold tracking-wider uppercase border-b border-[#E6E9F0]">
                <th className="py-3.5 px-6">Module Name</th>
                {actions.map((act) => (
                  <th key={act} className="py-3.5 px-4 text-center font-bold">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E9F0] text-sm">
              {Object.keys(permissionsByModule).map((modKey) => {
                const modPerms = permissionsByModule[modKey] || [];
                const formattedName = modKey
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <tr key={modKey} className="hover:bg-[#F2F4F8]/50 transition">
                    <td className="py-3 px-6 font-semibold text-xs text-[#18213A]">
                      {formattedName}
                    </td>

                    {actions.map((act) => {
                      const perm = modPerms.find((p: any) => p.action === act);
                      if (!perm) {
                        return (
                          <td key={act} className="py-3 px-4 text-center text-[#9AA1B5] text-xs">
                            —
                          </td>
                        );
                      }

                      const isChecked =
                        selectedRole?.slug === 'super-admin' || selectedPermIds.includes(perm.id);

                      return (
                        <td key={act} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={selectedRole?.slug === 'super-admin'}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 text-[#B8862E] accent-[#B8862E] rounded border-[#E6E9F0] focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
