'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Migration: Ajout organization_id aux tables manquantes');
    
    // 1. store_settings
    await queryInterface.addColumn('store_settings', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporaire
    });
    
    await queryInterface.sequelize.query(`
      UPDATE store_settings SET organization_id = 1 WHERE organization_id IS NULL;
    `);
    
    await queryInterface.changeColumn('store_settings', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
    
    await queryInterface.addIndex('store_settings', ['organization_id'], {
      name: 'idx_store_settings_organization_id',
    });
    
    // 2. hash_chain
    await queryInterface.addColumn('hash_chain', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporaire
    });
    
    await queryInterface.sequelize.query(`
      UPDATE hash_chain hc
      SET organization_id = s.organization_id
      FROM sales s
      WHERE hc.sale_id = s.id AND hc.organization_id IS NULL;
    `);
    
    await queryInterface.changeColumn('hash_chain', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
    
    await queryInterface.addIndex('hash_chain', ['organization_id'], {
      name: 'idx_hash_chain_organization_id',
    });
    
    console.log('✅ Migration complétée');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('hash_chain', 'idx_hash_chain_organization_id');
    await queryInterface.removeColumn('hash_chain', 'organization_id');
    
    await queryInterface.removeIndex('store_settings', 'idx_store_settings_organization_id');
    await queryInterface.removeColumn('store_settings', 'organization_id');
  }
};
