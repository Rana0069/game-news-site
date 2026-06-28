'use client'

import { useState, useEffect } from 'react'
import { User, Shield } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then(setUsers).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="font-display font-black text-2xl text-white">Users</h1>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                      <User size={14} className="text-black" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">{user.name || 'Unnamed'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-sm text-gray-400">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`badge text-xs ${user.role === 'admin' ? 'badge-neon' : user.role === 'editor' ? 'badge-purple' : 'badge-green'}`}>
                    <Shield size={10} />
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
