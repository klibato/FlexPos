import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Shield,
  Zap,
  Clock,
  Lock,
  CheckCircle,
  ArrowRight,
  Smartphone,
  BarChart3,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Heart,
  Award,
  Utensils,
  Croissant,
  Truck,
  Store
} from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const goToLogin = () => window.location.href = 'https://app.flexpos.app/login';
  const goToSignup = () => navigate('/signup');

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  // Problèmes que FlexPOS résout
  const problems = [
    "Caisses enregistreuses coûteuses et compliquées à utiliser",
    "Peur des contrôles fiscaux et de la non-conformité",
    "Logiciels obsolètes qui plantent au pire moment",
    "Abonnements trop chers pour votre chiffre d'affaires"
  ];

  // Avantages clés
  const benefits = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Fonctionne partout",
      description: "Sur votre tablette, téléphone ou ordinateur. Rien à installer, ça marche tout de suite."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% conforme à la loi",
      description: "Certifié NF525 pour les contrôles fiscaux. Dormez tranquille, vous êtes en règle."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Prêt en 10 minutes",
      description: "Créez votre compte, ajoutez vos produits, encaissez. C'est vraiment aussi simple."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Prix transparent",
      description: "Pas de surprise sur la facture. À partir de 29€/mois, essai gratuit sans carte bancaire."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Vos données sécurisées",
      description: "Hébergement en France, sauvegardes automatiques, accès crypté. Vos données restent les vôtres."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Pilotez votre activité",
      description: "Chiffre d'affaires en temps réel, rapports automatiques, exports simples pour votre comptable."
    }
  ];

  // Étapes comment ça marche
  const steps = [
    {
      number: "1",
      title: "Créez votre compte",
      description: "En 2 minutes, sans carte bancaire. Juste votre email et c'est parti."
    },
    {
      number: "2",
      title: "Ajoutez vos produits",
      description: "Importez votre carte ou créez vos produits un par un. Personnalisez vos catégories."
    },
    {
      number: "3",
      title: "Encaissez vos clients",
      description: "Votre caisse est prête ! Acceptez les paiements et suivez vos ventes en direct."
    }
  ];

  // Segments clients
  const segments = [
    { icon: <Utensils className="w-10 h-10" />, name: "Restaurants & Fast-foods" },
    { icon: <Croissant className="w-10 h-10" />, name: "Boulangeries & Pâtisseries" },
    { icon: <Truck className="w-10 h-10" />, name: "Food Trucks" },
    { icon: <Store className="w-10 h-10" />, name: "Commerces de proximité" }
  ];

  // Tarifs
  const pricing = [
    {
      name: "Essai Gratuit",
      price: "0€",
      period: "30 jours",
      description: "Testez toutes les fonctionnalités",
      features: [
        "Toutes les fonctionnalités incluses",
        "Sans carte bancaire",
        "Support par email",
        "Données conservées après l'essai"
      ],
      cta: "Démarrer l'essai gratuit",
      highlighted: false
    },
    {
      name: "Mensuel",
      price: "39€",
      period: "/mois",
      description: "Sans engagement, annulez quand vous voulez",
      features: [
        "Utilisateurs illimités",
        "Conformité NF525 incluse",
        "Support prioritaire",
        "Mises à jour automatiques",
        "Exports comptables"
      ],
      cta: "Essayer gratuitement",
      highlighted: true
    },
    {
      name: "Annuel",
      price: "29€",
      period: "/mois",
      description: "2 mois offerts, meilleur rapport qualité/prix",
      features: [
        "Tout le plan Mensuel",
        "2 mois gratuits",
        "Support téléphonique",
        "Formation offerte",
        "Accompagnement personnalisé"
      ],
      cta: "Économiser 20%",
      highlighted: false
    }
  ];

  // FAQ
  const faqs = [
    {
      question: "Est-ce vraiment conforme à la législation française ?",
      answer: "Oui, FlexPOS est 100% conforme à la norme NF525 (décret n°2016-1551). Chaque vente est enregistrée avec une signature numérique inaltérable. En cas de contrôle fiscal, vous pouvez exporter tous vos justificatifs en un clic."
    },
    {
      question: "Que se passe-t-il si ma connexion Internet coupe ?",
      answer: "FlexPOS fonctionne même hors-ligne ! Vos ventes sont enregistrées localement et se synchronisent automatiquement dès que la connexion revient. Vous ne perdez jamais de données."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Vos données sont hébergées en France, cryptées et sauvegardées automatiquement chaque jour. Seuls vous et vos employés autorisés y ont accès. Nous sommes conformes au RGPD."
    },
    {
      question: "Puis-je annuler mon abonnement facilement ?",
      answer: "Oui, vous pouvez annuler à tout moment depuis votre espace client. Pas de préavis, pas de frais cachés. Vos données restent accessibles pendant 30 jours après l'annulation."
    },
    {
      question: "Proposez-vous une formation ?",
      answer: "Oui ! Nous proposons des tutoriels vidéo gratuits, une documentation complète, et pour les abonnés annuels, une session de formation personnalisée avec notre équipe."
    },
    {
      question: "Quel support en cas de problème ?",
      answer: "Notre équipe française vous répond par email sous 24h (ou 4h pour les abonnés prioritaires). Pour les urgences, les abonnés annuels ont accès à une hotline téléphonique."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Flex<span className="text-orange-500">POS</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#avantages" className="text-gray-600 hover:text-gray-900 transition">
                Avantages
              </a>
              <a href="#tarifs" className="text-gray-600 hover:text-gray-900 transition">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition">
                FAQ
              </a>
              <button
                onClick={goToLogin}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Connexion
              </button>
              <button
                onClick={goToSignup}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Essai gratuit
              </button>
            </nav>
            {/* Mobile menu button */}
            <button
              onClick={goToSignup}
              className="md:hidden px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
            >
              Essai gratuit
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge de réassurance */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-8">
              <CheckCircle className="w-4 h-4" />
              <span>Conforme NF525</span>
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              <span>Hébergé en France</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              La caisse moderne qui{' '}
              <span className="text-orange-500">simplifie votre quotidien</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Encaissez vos clients en quelques clics. Conforme à la loi française,
              aucune installation requise. Essayez gratuitement pendant 30 jours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={goToSignup}
                className="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 text-lg font-semibold flex items-center justify-center gap-2"
              >
                Essayer gratuitement pendant 30 jours
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-lg text-lg font-semibold border border-gray-200"
              >
                Voir comment ça marche
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Installation en 10 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Support en français</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problèmes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Vous en avez assez de...
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {problems.map((problem, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <span className="text-red-500 text-xl">✗</span>
                <span className="text-gray-700">{problem}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-orange-500">
              FlexPOS a été conçu pour vous.
            </p>
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section id="avantages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FlexPOS ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une caisse simple, fiable et conforme. Tout ce dont vous avez besoin, rien de superflu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors duration-300 border border-gray-100 hover:border-orange-200"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 mb-5">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="demo" className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              3 étapes simples pour commencer à encaisser vos clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-orange-100">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={goToSignup}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition shadow-lg text-lg font-semibold inline-flex items-center gap-2"
            >
              Démarrer maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section Pour qui */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              FlexPOS, c'est pour qui ?
            </h2>
            <p className="text-xl text-gray-600">
              Une solution adaptée à tous les commerces de bouche
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors border border-gray-100 hover:border-orange-200"
              >
                <div className="text-orange-500 mb-4">
                  {segment.icon}
                </div>
                <span className="text-gray-700 font-medium text-center">{segment.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Réassurance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Rejoignez les commerçants qui ont simplifié leur gestion
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 justify-center">
              <Award className="w-8 h-8 text-orange-500" />
              <span className="text-gray-700">Interface pensée par des restaurateurs</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Phone className="w-8 h-8 text-orange-500" />
              <span className="text-gray-700">Support client en français</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Zap className="w-8 h-8 text-orange-500" />
              <span className="text-gray-700">Mises à jour automatiques et gratuites</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pas de frais cachés, pas de mauvaise surprise. Annulez quand vous voulez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 scale-105'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-orange-100">
                    Le plus populaire
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-orange-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-lg ${plan.highlighted ? 'text-orange-100' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-orange-200' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={goToSignup}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    plan.highlighted
                      ? 'bg-white text-orange-600 hover:bg-orange-50'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir avant de vous lancer
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Prêt à moderniser votre caisse ?
          </h2>
          <p className="text-xl mb-10 text-orange-100 max-w-2xl mx-auto">
            Essayez FlexPOS gratuitement pendant 30 jours.
            Aucune carte bancaire requise.
          </p>
          <button
            onClick={goToSignup}
            className="px-10 py-5 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition shadow-xl text-xl font-bold inline-flex items-center gap-3"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="mt-6 text-orange-200 text-sm">
            Installation en moins de 10 minutes • Support en français • Annulation sans frais
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FlexPOS</span>
              </div>
              <p className="text-gray-400 mb-4">
                La caisse moderne pour les commerçants français.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Hébergé en France 🇫🇷</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#avantages" className="hover:text-white transition">Avantages</a></li>
                <li><a href="#tarifs" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition">CGV</a></li>
                <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Conformité NF525</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@flexpos.app" className="hover:text-white transition">contact@flexpos.app</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 FlexPOS. Tous droits réservés.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Fait avec <Heart className="w-4 h-4 text-red-500" /> pour les commerçants français
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
