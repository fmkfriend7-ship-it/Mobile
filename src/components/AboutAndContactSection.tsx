import React, { useEffect, useRef, useState } from 'react';
import { Check, Edit3, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import { FmkLogo } from './FmkLogo';

const STORAGE_PHONE_KEY = 'fmk_contact_phone';
const STORAGE_ADDRESS_KEY = 'fmk_business_address';

export const AboutAndContactSection: React.FC = () => {
  const [contactNumber, setContactNumber] = useState<string>('+1 (800) 555-0199');
  const [businessAddress, setBusinessAddress] = useState<string>(
    'Suite 402, FMK Flagship Pavilion, Fifth Avenue, New York, NY'
  );
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftPhone, setDraftPhone] = useState(contactNumber);
  const [draftAddress, setDraftAddress] = useState(businessAddress);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('Product Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem(STORAGE_PHONE_KEY);
      const savedAddress = localStorage.getItem(STORAGE_ADDRESS_KEY);
      if (savedPhone) {
        setContactNumber(savedPhone);
        setDraftPhone(savedPhone);
      }
      if (savedAddress) {
        setBusinessAddress(savedAddress);
        setDraftAddress(savedAddress);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const savePhone = () => {
    const clean = draftPhone.trim() || '+1 (800) 555-0199';
    setContactNumber(clean);
    setDraftPhone(clean);
    setEditingPhone(false);
    try {
      localStorage.setItem(STORAGE_PHONE_KEY, clean);
    } catch {
      // ignore
    }
  };

  const saveAddress = () => {
    const clean =
      draftAddress.trim() ||
      'Suite 402, FMK Flagship Pavilion, Fifth Avenue, New York, NY';
    setBusinessAddress(clean);
    setDraftAddress(clean);
    setEditingAddress(false);
    try {
      localStorage.setItem(STORAGE_ADDRESS_KEY, clean);
    } catch {
      // ignore
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;
    setSubmitted(true);
    setSenderName('');
    setSenderEmail('');
    setMessage('');
  };

  const focusContactForm = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section
      id="about-contact"
      className="border-t border-white/10 bg-[#09090B] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* About Us Block */}
        <div className="mb-16 grid grid-cols-1 gap-10 rounded-2xl border border-white/10 bg-[#111115] p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-7">
            <p className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              About FMK Mobile Store
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#FAFAFA] sm:text-5xl">
              Crafted for Visionaries. Curated by Faria.
            </h2>
            <p className="text-base leading-relaxed text-[#D4D4D8]">
              Welcome to the <span className="font-semibold text-[#FAFAFA]">FMK Mobile Website</span>—the
              international flagship destination of <span className="font-semibold text-[#D4AF37]">FMK</span>,
              founded and led by <span className="font-semibold text-[#FAFAFA]">Faria (FARIA)</span>.
              We unite factory-sealed flagship smartphones with transparent 3D hardware engineering so every buyer can inspect exterior craftsmanship and internal precision before making a purchase.
            </p>
            <p className="text-sm leading-relaxed text-[#A1A1AA]">
              From classic iPhone 13 editions to the latest titanium iPhone 17 flagship, FMK Mobile Store guarantees authentic serial-verified devices, concierge hardware diagnostics, and insured global delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
            <div className="rounded-xl border border-white/10 bg-[#18181D] p-5">
              <div className="text-xs font-medium text-[#A1A1AA]">Company Name</div>
              <div className="font-display mt-1 text-2xl font-semibold text-[#D4AF37]">
                FMK
              </div>
              <div className="mt-2 text-xs text-[#71717A]">International Mobile Flagship</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#18181D] p-5">
              <div className="text-xs font-medium text-[#A1A1AA]">Founder & Owner</div>
              <div className="font-display mt-1 text-2xl font-semibold text-[#FAFAFA]">
                Faria (FARIA)
              </div>
              <div className="mt-2 text-xs text-[#71717A]">Executive Leadership</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#18181D] p-5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#A1A1AA]">Website</div>
                  <div className="mt-1 text-base font-semibold text-[#FAFAFA]">
                    FMK Mobile Website
                  </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information + Contact Form */}
        <div id="contact" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Editable Business Contact Details */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111115] p-8 lg:col-span-5">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                  Concierge & Storefront
                </p>
                <h3 className="font-display mt-2 text-3xl font-semibold text-[#FAFAFA]">
                  Contact Information
                </h3>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                  Reach FMK directly or update store contact details in place.
                </p>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#71717A]">Owner Name</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#FAFAFA]">
                      Faria (FARIA)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-[#71717A]">Company</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#D4AF37]">FMK</div>
                  </div>
                </div>

                {/* Editable Contact Number */}
                <div className="rounded-xl border border-white/10 bg-[#18181D] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                      <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                      Contact Number
                    </span>
                    {editingPhone ? (
                      <button
                        type="button"
                        onClick={savePhone}
                        className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:underline"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftPhone(contactNumber);
                          setEditingPhone(true);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-[#D4AF37]"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingPhone ? (
                    <input
                      type="text"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePhone();
                      }}
                      aria-label="Edit contact number"
                      className="font-mono-tabular mt-2 w-full rounded-lg border border-[#D4AF37] bg-[#09090B] px-3 py-1.5 text-sm text-[#FAFAFA] focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono-tabular mt-1.5 text-sm font-semibold text-[#FAFAFA]">
                      {contactNumber}
                    </div>
                  )}
                </div>

                {/* Editable Business Address */}
                <div className="rounded-xl border border-white/10 bg-[#18181D] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                      <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                      Business Address
                    </span>
                    {editingAddress ? (
                      <button
                        type="button"
                        onClick={saveAddress}
                        className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37] hover:underline"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftAddress(businessAddress);
                          setEditingAddress(true);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-[#D4AF37]"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingAddress ? (
                    <textarea
                      rows={2}
                      value={draftAddress}
                      onChange={(e) => setDraftAddress(e.target.value)}
                      aria-label="Edit business address"
                      className="mt-2 w-full rounded-lg border border-[#D4AF37] bg-[#09090B] px-3 py-1.5 text-sm text-[#FAFAFA] focus:outline-none"
                    />
                  ) : (
                    <div className="mt-1.5 text-sm leading-relaxed text-[#FAFAFA]">
                      {businessAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={focusContactForm}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158]"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="rounded-2xl border border-white/10 bg-[#111115] p-8 lg:col-span-7">
            <h3 className="font-display text-3xl font-semibold text-[#FAFAFA]">
              Send a Direct Inquiry
            </h3>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Speak with Faria’s flagship advisory team regarding iPhone availability, corporate orders, or technical hardware specifications.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-6">
                <div className="text-base font-semibold text-[#D4AF37]">
                  Inquiry Received by FMK Mobile Store
                </div>
                <p className="mt-2 text-sm text-[#E4E4E7]">
                  Thank you for contacting FMK. Faria’s concierge team will respond to your inquiry shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-lg border border-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#09090B]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                      Your Name
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-white/15 bg-[#18181D] px-4 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/15 bg-[#18181D] px-4 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                    Inquiry Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#18181D] px-4 py-2.5 text-sm text-[#FAFAFA] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Product Inquiry">Flagship iPhone Purchase Inquiry</option>
                    <option value="3D Hardware Parts">Hardware & Component Specification</option>
                    <option value="Corporate Order">VIP / Corporate Bulk Order</option>
                    <option value="Support">Warranty & Concierge Support</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us which iPhone model, storage, or service you are looking for..."
                    className="w-full rounded-xl border border-white/15 bg-[#18181D] px-4 py-2.5 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FAFAFA] px-6 py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#D4AF37]"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message to FMK</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <FmkLogo />
            <p className="mt-2 text-xs text-[#71717A]">
              FMK Mobile Website · Company: FMK · Owner: Faria (FARIA)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#A1A1AA]">
            <a href="#experience-3d" className="hover:text-[#D4AF37]">
              3D Studio
            </a>
            <a href="#mobile-parts" className="hover:text-[#D4AF37]">
              Mobile Parts
            </a>
            <a href="#iphones" className="hover:text-[#D4AF37]">
              iPhones
            </a>
            <a href="#technology" className="hover:text-[#D4AF37]">
              Technology
            </a>
            <a href="#contact" className="hover:text-[#D4AF37]">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
};
