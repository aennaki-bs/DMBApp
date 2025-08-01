import { UserDto } from "@/services/adminService";

export interface PrintUserData {
  users: UserDto[];
  title?: string;
  date?: string;
}

// Helper function to get role string (same logic as in UserTableRow)
function getRoleString(
  role: string | { roleId?: number; roleName?: string }
): string {
  if (typeof role === "string") {
    return role;
  }

  if (role && typeof role === "object" && "roleName" in role) {
    return role.roleName || "Unknown";
  }

  return "Unknown";
}

export const printUserData = ({ users, title = "User Management Report", date }: PrintUserData) => {
  try {
    // Debug: Log the first user's role to see its structure
    if (users.length > 0) {
      console.log('First user role:', users[0].role, 'Type:', typeof users[0].role);
      console.log('Processed role:', getRoleString(users[0].role));
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      throw new Error('Failed to open print window');
    }

    // Generate the HTML content with enhanced UI and alignment
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
          }
          
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .report-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 30px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          
          .report-info .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .report-info .info-item i {
            width: 16px;
            height: 16px;
            background: #2563eb;
            border-radius: 50%;
            display: inline-block;
          }
          
          .table-container {
            padding: 0;
            overflow-x: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            background: white;
          }
          
          thead {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          th {
            padding: 18px 16px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
            position: relative;
          }
          
          th::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
          }
          
          td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            transition: all 0.2s ease;
          }
          
          tbody tr {
            transition: all 0.2s ease;
          }
          
          tbody tr:hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          
          tbody tr:nth-child(even) {
            background: #fafbfc;
          }
          
          tbody tr:nth-child(even):hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          }
          
          .user-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .user-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 15px;
          }
          
          .user-id {
            font-size: 12px;
            color: #64748b;
            font-family: 'Courier New', monospace;
          }
          
          .user-email {
            color: #2563eb;
            font-weight: 500;
            word-break: break-all;
          }
          
          .role-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 80px;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
          }
          
          .role-badge::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .role-badge:hover::before {
            left: 100%;
          }
          
          .role-admin {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
          }
          
          .role-fulluser {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
          }
          
          .role-simpleuser {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }
          
          .role-unknown {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          }
          
          .status-inactive {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
          }
          
          .status-badge::before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0.8;
          }
          
          .created-date {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
          }
          
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .footer-info {
            text-align: left;
          }
          
          .footer-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .footer-subtitle {
            font-size: 12px;
            color: #64748b;
          }
          
          .footer-stats {
            text-align: right;
          }
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            font-size: 12px;
            color: #64748b;
          }
          
                     .stat-value {
             font-weight: 600;
             color: #2563eb;
           }
           
           .print-button {
             position: fixed;
             top: 20px;
             right: 20px;
             background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
             color: white;
             border: none;
             padding: 12px 24px;
             border-radius: 8px;
             font-weight: 600;
             font-size: 14px;
             cursor: pointer;
             box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
             transition: all 0.3s ease;
             z-index: 1000;
             display: flex;
             align-items: center;
             gap: 8px;
           }
           
           .print-button:hover {
             transform: translateY(-2px);
             box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
             background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
           }
           
           .print-button:active {
             transform: translateY(0);
           }
           
           .print-button svg {
             width: 16px;
             height: 16px;
           }
           
           @media print {
            body {
              background: white !important;
              padding: 0 !important;
            }
            
            .container {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
            }
            
            .header {
              background: #2563eb !important;
              color: white !important;
            }
            
            .header::before {
              display: none !important;
            }
            
            tbody tr:hover {
              background: inherit !important;
              transform: none !important;
              box-shadow: none !important;
            }
            
                         .role-badge::before,
             .status-badge::before {
               display: none !important;
             }
             
             .print-button {
               display: none !important;
             }
             
             /* Ensure no page breaks inside rows */
             tr {
               page-break-inside: avoid;
             }
             
             /* Ensure headers repeat on each page */
             thead {
               display: table-header-group;
             }
             
             tbody {
               display: table-row-group;
             }
           }
          
          @media (max-width: 768px) {
            .report-info {
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
            
            .footer-content {
              flex-direction: column;
              gap: 15px;
              text-align: center;
            }
            
            .footer-info,
            .footer-stats {
              text-align: center;
            }
            
            th, td {
              padding: 12px 8px;
              font-size: 12px;
            }
            
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
             <body>
         <button class="print-button" onclick="window.print()">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
           </svg>
           Print Report
         </button>
         <div class="container">
           <div class="header">
            <h1>${title}</h1>
            <div class="subtitle">Professional User Management Report</div>
          </div>
          
          <div class="report-info">
            <div class="info-item">
              <i></i>
              <span>Generated on: ${date || new Date().toLocaleString()}</span>
            </div>
            <div class="info-item">
              <i></i>
              <span>Total Users: ${users.length}</span>
            </div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>User Information</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(user => `
                  <tr>
                    <td>
                      <div class="user-info">
                        <div class="user-name">${user.firstName} ${user.lastName}</div>
                        <div class="user-id">ID: ${user.id}</div>
                      </div>
                    </td>
                    <td>
                      <div class="user-email">${user.email}</div>
                    </td>
                    <td>
                      <span class="role-badge role-${getRoleString(user.role).toLowerCase()}">
                        ${getRoleString(user.role)}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div class="created-date">
                        ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-info">
                <div class="footer-title">Document Management System</div>
                <div class="footer-subtitle">Professional User Report</div>
              </div>
              <div class="footer-stats">
                <div class="stat-item">
                  <span>Active Users:</span>
                  <span class="stat-value">${users.filter(u => u.isActive).length}</span>
                </div>
                <div class="stat-item">
                  <span>Inactive Users:</span>
                  <span class="stat-value">${users.filter(u => !u.isActive).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    };
  } catch (error) {
    console.error('Error in printUserData:', error);
    throw new Error(`HTML print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const printSelectedUsers = (users: UserDto[], title?: string) => {
  if (!users || users.length === 0) {
    console.warn('No users selected for printing');
    return;
  }
  
  printUserData({ 
    users, 
    title: title || `Selected Users Report (${users.length} users)`, 
    date: new Date().toLocaleString() 
  });
}; 