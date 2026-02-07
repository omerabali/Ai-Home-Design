import React from "react";
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Twitter,
    Dribbble,
    Globe,
    Sparkles
} from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "./ui/hover-footer";

function HoverFooter() {
    // Footer link data
    const footerLinks = [
        {
            title: "Hakkımızda",
            links: [
                { label: "Hikayemiz", href: "#" },
                { label: "Ekibimiz", href: "#" },
                { label: "Kariyer", href: "#" },
            ],
        },
        {
            title: "Destek",
            links: [
                { label: "SSS", href: "#" },
                { label: "İletişim", href: "#" },
                {
                    label: "Canlı Destek",
                    href: "#",
                    pulse: true,
                },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={24} className="text-[#3ca2fa]" />,
            text: "hello@designai.com",
            href: "mailto:hello@designai.com",
        },
        {
            icon: <Phone size={24} className="text-[#3ca2fa]" />,
            text: "+90 555 123 45 67",
            href: "tel:+905551234567",
        },
        {
            icon: <MapPin size={24} className="text-[#3ca2fa]" />,
            text: "Istanbul, Türkiye",
        },
    ];

    // Social media icons
    const socialLinks = [
        { icon: <Facebook size={24} />, label: "Facebook", href: "#" },
        { icon: <Instagram size={24} />, label: "Instagram", href: "#" },
        { icon: <Twitter size={24} />, label: "Twitter", href: "#" },
        { icon: <Globe size={24} />, label: "Web", href: "#" },
    ];

    return (
        <footer className="bg-[#0F0F11]/90 backdrop-blur-3xl relative min-h-[600px] rounded-t-[3rem] overflow-hidden mt-20 border-t border-white/5 mx-4 mb-4 pb-0 flex flex-col justify-between">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-12 w-full z-20 relative pt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* Brand section - Spans 4 columns */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center space-x-3">
                            <span className="text-[#3ca2fa] p-2 bg-[#3ca2fa]/10 rounded-xl animate-pulse">
                                <Sparkles size={32} />
                            </span>
                            <span className="text-white text-3xl font-bold tracking-tight">DesignAI</span>
                        </div>
                        <p className="text-base leading-relaxed text-gray-400 max-w-sm">
                            Yapay zeka ile hayalinizdeki mekanları tasarlayın. Modern teknolojinin estetikle buluştuğu nokta.
                        </p>

                        {/* Social icons moved here for better mobile layout */}
                        <div className="flex gap-4 pt-4">
                            {socialLinks.map(({ icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-[#3ca2fa] transition-all duration-300"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Spacer col */}
                    <div className="hidden lg:block lg:col-span-2"></div>

                    {/* Links sections - Spans 3 columns each */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white text-lg font-semibold mb-8 flex items-center gap-2">
                            Hızlı Erişim
                        </h4>
                        <ul className="space-y-4">
                            {footerLinks[0].links.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-400 hover:text-[#3ca2fa] transition-colors text-base block py-1">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            {footerLinks[1].links.map((link) => (
                                <li key={link.label} className="relative">
                                    <a href={link.href} className="text-gray-400 hover:text-[#3ca2fa] transition-colors text-base block py-1">
                                        {link.label}
                                    </a>
                                    {link.pulse && (
                                        <span className="absolute top-2 right-20 w-1.5 h-1.5 rounded-full bg-[#3ca2fa] animate-pulse"></span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact section - Spans 3 columns */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white text-lg font-semibold mb-8">
                            İletişim
                        </h4>
                        <ul className="space-y-6">
                            {contactInfo.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-gray-400 group cursor-pointer">
                                    <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-[#3ca2fa]/20 group-hover:text-[#3ca2fa] transition-colors">
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-500 mb-0.5">{i === 0 ? 'Email' : i === 1 ? 'Telefon' : 'Adres'}</span>
                                        {item.href ? (
                                            <a href={item.href} className="text-gray-300 group-hover:text-white transition-colors text-base">
                                                {item.text}
                                            </a>
                                        ) : (
                                            <span className="text-gray-300 text-base">
                                                {item.text}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="border-t border-white/5 my-12" />

                {/* Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} DesignAI Inc. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
                        <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
                    </div>
                </div>
            </div>

            {/* Huge Text Effect at Bottom */}
            <div className="w-full h-[300px] md:h-[400px] relative mt-auto pointer-events-none flex items-end justify-center overflow-hidden">
                <div className="pointer-events-auto w-full max-w-[90%] mx-auto transform translate-y-[20%]"> {/* Pushes text partially down for effect */}
                    <TextHoverEffect text="DESIGN AI" className="z-10 opacity-50" />
                </div>
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}

export default HoverFooter;
