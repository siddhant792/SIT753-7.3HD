#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { createTenantSchema } = require('./db-migrate');


const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function createTenant(name, adminEmail, adminPassword, adminName) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    
    const tenantResult = await client.query(
      'INSERT INTO tenants (name, schema_name) VALUES ($1, $2) RETURNING *',
      [name, `tenant_${Date.now()}`]
    );
    
    const tenant = tenantResult.rows[0];
    
    
    await createTenantSchema(tenant.id);
    
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    await client.query(
      `INSERT INTO tenant_${tenant.id}.users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)`,
      [adminEmail, passwordHash, adminName, 'admin']
    );
    
    await client.query('COMMIT');
    console.log(`Tenant created successfully with ID: ${tenant.id}`);
    return tenant;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deleteTenant(tenantId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    
    const tenantResult = await client.query(
      'SELECT schema_name FROM tenants WHERE id = $1',
      [tenantId]
    );
    
    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    
    
    await client.query(`DROP SCHEMA IF EXISTS ${tenantResult.rows[0].schema_name} CASCADE`);
    
    
    await client.query('DELETE FROM tenants WHERE id = $1', [tenantId]);
    
    await client.query('COMMIT');
    console.log(`Tenant ${tenantId} deleted successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listTenants() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM tenants ORDER BY created_at DESC');
    console.log('Tenants:');
    result.rows.forEach(tenant => {
      console.log(`ID: ${tenant.id}, Name: ${tenant.name}, Created: ${tenant.created_at}`);
    });
    return result.rows;
  } finally {
    client.release();
  }
}


async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'create':
        const [name, email, password, adminName] = process.argv.slice(3);
        if (!name || !email || !password) {
          console.error('Usage: node manage-tenant.js create <name> <email> <password> [adminName]');
          process.exit(1);
        }
        await createTenant(name, email, password, adminName || 'Admin');
        break;
        
      case 'delete':
        const tenantId = process.argv[3];
        if (!tenantId) {
          console.error('Usage: node manage-tenant.js delete <tenantId>');
          process.exit(1);
        }
        await deleteTenant(tenantId);
        break;
        
      case 'list':
        await listTenants();
        break;
        
      default:
        console.log(`
Usage:
  node manage-tenant.js create <name> <email> <password> [adminName]
  node manage-tenant.js delete <tenantId>
  node manage-tenant.js list
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createTenant,
  deleteTenant,
  listTenants,
}; 