const { Sale, SaleItem, User, Product } = require('../models');

async function checkDatabase() {
  try {
    console.log('\n=== VÉRIFICATION BASE DE DONNÉES ===\n');

    // Compter les ventes
    const salesCount = await Sale.count();
    console.log(`📊 Nombre total de ventes: ${salesCount}`);

    // Récupérer les 3 dernières ventes avec détails
    const recentSales = await Sale.findAll({
      limit: 3,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: SaleItem,
          as: 'items',
        },
      ],
    });

    console.log('\n📋 Dernières ventes:\n');

    for (const sale of recentSales) {
      console.log(`Ticket: ${sale.ticket_number}`);
      console.log(`  User ID: ${sale.user_id}`);
      console.log(`  Total HT: ${sale.total_ht}€`);
      console.log(`  Total TTC: ${sale.total_ttc}€`);
      console.log(`  TVA Details: ${JSON.stringify(sale.vat_details)}`);
      console.log(`  Paiement: ${sale.payment_method}`);
      console.log(`  Montant payé: ${sale.amount_paid}€`);
      console.log(`  Monnaie rendue: ${sale.change_given}€`);
      console.log(`  Status: ${sale.status}`);
      console.log(`  Date: ${sale.created_at}`);
      console.log(`  Nombre d'articles: ${sale.items.length}`);

      if (sale.items.length > 0) {
        console.log('  Articles:');
        sale.items.forEach(item => {
          console.log(`    - ${item.product_name} x${item.quantity} = ${item.total_ttc}€ TTC (TVA ${item.vat_rate}%)`);
        });
      }
      console.log('');
    }

    // Statistiques
    const totalRevenue = await Sale.sum('total_ttc', {
      where: { status: 'completed' },
    });

    console.log(`💰 Chiffre d'affaires total: ${totalRevenue || 0}€\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkDatabase();
