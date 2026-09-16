import {
  CONTACT_EMAIL,
  COMPANY_WEBSITE,
  COMPANY_WEBSITE_LABEL,
} from "@/lib/site";
import {
  LEGAL_ENTITY_NAME,
  LEGAL_REGISTERED_ADDRESS,
  PRIVACY_POLICY_UPDATED_ON,
  type LegalDocument,
  type LegalFact,
} from "@/lib/legal";

/**
 * Política de privacidad de Ardeno Group.
 *
 * El texto es el del documento aprobado por Ardeno («Privacy Policy_Ardeno
 * Web»), transcrito literalmente y sin reescribir: es contenido legal, no copy
 * de marketing, así que aquí no se resume, ni se mejora, ni se adapta el tono.
 * Lo único que cambia es la forma —de párrafos corridos en Word a apartados con
 * su ancla— para que se pueda leer en pantalla y enlazar por partes.
 *
 * DOS DIFERENCIAS RESPECTO AL DOCUMENTO, LAS DOS DELIBERADAS:
 *
 * 1. No se publica la frase «Before publication, the company may add its legal
 *    entity name, registered address, and any additional corporate details
 *    required by applicable law». Es una nota interna para quien redacta, no
 *    una cláusula: publicarla anunciaría al visitante que el documento está sin
 *    terminar. Lo que esa frase pide queda como dato configurable —ver
 *    `src/lib/legal.ts`— y aparece en cuanto Ardeno lo confirme.
 * 2. La fecha de última actualización no se inventa. El apartado «Changes to
 *    This Privacy Policy» promete indicarla, así que se pinta cuando exista
 *    `ARDENO_PRIVACY_POLICY_UPDATED_ON` y no antes.
 *
 * El correo y la web salen de `site.ts` en vez de estar escritos tres veces:
 * el documento los repite en cuatro apartados y una dirección que cambie en un
 * sitio y no en los otros es un documento legal que se contradice.
 */

/**
 * Datos registrales del responsable, solo los confirmados.
 *
 * Etiqueta y valor, no prosa: así se añaden sin redactar una cláusula nueva
 * —que sería escribir texto legal por nuestra cuenta— y el apartado se lee
 * igual con ninguno, con uno o con los dos.
 */
function controllerFacts(): LegalFact[] | undefined {
  const facts: LegalFact[] = [];

  if (LEGAL_ENTITY_NAME) {
    facts.push({ label: "Legal entity", value: LEGAL_ENTITY_NAME });
  }
  if (LEGAL_REGISTERED_ADDRESS) {
    facts.push({
      label: "Registered address",
      value: LEGAL_REGISTERED_ADDRESS,
    });
  }

  return facts.length > 0 ? facts : undefined;
}

export const privacyPolicy: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  updatedOn: PRIVACY_POLICY_UPDATED_ON,

  intro: [
    "At Ardeno Group, we value the privacy of individuals who visit our website, contact us, or express interest in our real estate developments. This Privacy Policy explains what information we may collect, how we use it, with whom we may share it, and what rights users may have regarding their personal information. By using this website or submitting information through our contact forms, the user acknowledges and accepts this Privacy Policy.",
  ],

  sections: [
    {
      id: "data-controller",
      heading: "Data Controller",
      paragraphs: [
        `The data controller responsible for the processing of personal information is Ardeno Group. The website operated by Ardeno Group is ${COMPANY_WEBSITE_LABEL}, and the main contact email for privacy-related matters is ${CONTACT_EMAIL}. Ardeno Group’s primary business operations are based in North Carolina, United States.`,
      ],
      facts: controllerFacts(),
    },
    {
      id: "information-we-may-collect",
      heading: "Information We May Collect",
      paragraphs: [
        "Ardeno Group may collect personal information that users provide directly when they contact us, complete a form, request information, communicate by email, participate in calls or meetings, or otherwise interact with us. This information may include full name, email address, phone number, country, city, general location, and details related to their interest in real estate developments, investment opportunities, acquisitions, partnerships, or commercial relationships with Ardeno Group.",
        "We may also collect documentation or additional information voluntarily provided in connection with a potential investment, purchase, transaction, contractual relationship, due diligence process, or business interaction. In addition, our website may collect technical or browsing information, such as IP address, browser type, device information, pages visited, date and time of access, and information collected through cookies or similar technologies.",
      ],
    },
    {
      id: "how-we-use-the-information",
      heading: "How We Use the Information",
      paragraphs: [
        "Ardeno Group may use the information collected to respond to inquiries, provide information about real estate developments, communicate with potential investors, buyers, brokers, partners, or business contacts, and follow up on expressions of interest. We may also use it to prepare commercial, informational, or contractual documentation, coordinate meetings or calls, evaluate potential business relationships, improve website functionality and content, and enhance the user experience.",
        "Ardeno Group may process personal information when necessary to comply with legal, regulatory, tax, accounting, contractual, or compliance obligations, and to protect its rights, security, and legitimate business interests. Ardeno Group does not sell users’ personal information to third parties.",
      ],
    },
    {
      id: "commercial-communications",
      heading: "Commercial Communications",
      paragraphs: [
        `If a user provides contact information, Ardeno Group may send communications related to real estate projects, investment opportunities, corporate updates, market information, or other relevant business content. Users may request to stop receiving these communications at any time by contacting ${CONTACT_EMAIL}. Ardeno Group will take reasonable steps to remove the user from future marketing or commercial communications, subject to communications still necessary for legal, contractual, or transactional purposes.`,
      ],
    },
    {
      id: "sharing-information-with-third-parties",
      heading: "Sharing Information with Third Parties",
      paragraphs: [
        "Ardeno Group may share personal information with third parties when necessary, appropriate, or reasonable for the purposes described in this Privacy Policy. These may include legal, tax, accounting, financial, or business advisors; technology providers; hosting services; CRM platforms; email marketing providers; data storage providers; commercial partners; developers; builders; brokers; intermediaries; banks; financial institutions; or other service providers involved in analyzing, preparing, managing, or executing a potential transaction or business relationship.",
        "Ardeno Group may also disclose personal information to public authorities, regulators, courts, government agencies, or authorized parties when required by law, legal process, valid request, or to protect Ardeno Group’s rights and interests. When information is shared with providers or partners, Ardeno Group will seek to ensure that such parties handle the information appropriately and in line with the purposes for which it was provided.",
      ],
    },
    {
      id: "data-retention",
      heading: "Data Retention",
      paragraphs: [
        "Ardeno Group will retain personal information for as long as necessary to fulfill the purposes for which it was collected, including managing inquiries, maintaining business relationships, preparing or executing contracts, complying with legal or regulatory obligations, keeping accounting or tax records, and preserving information required for legitimate business purposes. When personal information is no longer necessary, Ardeno Group may delete it, anonymize it, or securely retain it when there is a valid legal, regulatory, contractual, or business reason to do so.",
      ],
    },
    {
      id: "data-security",
      heading: "Data Security",
      paragraphs: [
        "Ardeno Group adopts reasonable technical, administrative, and organizational measures to protect personal information against unauthorized access, loss, misuse, alteration, disclosure, or destruction. However, no method of internet transmission or electronic storage is completely secure. Users acknowledge that submitting information online involves inherent security risks, and Ardeno Group cannot guarantee absolute security.",
      ],
    },
    {
      id: "cookies-and-similar-technologies",
      heading: "Cookies and Similar Technologies",
      paragraphs: [
        "The Ardeno Group website may use cookies or similar technologies to improve browsing experience, analyze website traffic, remember user preferences, and optimize website functionality and communications. Users may configure their browser to reject, block, or delete cookies, but some parts of the website may not function properly if cookies are disabled.",
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-Party Links",
      paragraphs: [
        "The Ardeno Group website may contain links to third-party websites, including business partners, brokers, service providers, technology platforms, or external resources. Ardeno Group does not control and is not responsible for the privacy practices, content, security, or policies of third-party websites. Users should review the privacy policies of external websites before providing personal information.",
      ],
    },
    {
      id: "user-rights",
      heading: "User Rights",
      paragraphs: [
        "Depending on the user’s location and applicable laws, users may have rights regarding their data, including requesting access to their personal information, correction of inaccurate or incomplete information, deletion of personal information, objection to certain processing, restriction of processing, withdrawal of consent when processing is based on consent, or information about how their personal information is used and shared.",
        `Users may exercise applicable privacy rights by contacting ${CONTACT_EMAIL}. Ardeno Group may request additional information to verify the identity of the person making the request before processing it.`,
      ],
    },
    {
      id: "international-users",
      heading: "International Users",
      paragraphs: [
        "Ardeno Group operates primarily in the United States. If a user accesses the website from outside the United States, the user acknowledges that their personal information may be transferred to, stored in, or processed in the United States or other jurisdictions where Ardeno Group, its providers, or its business partners operate.",
        "Where data protection laws from the European Union, the United Kingdom, or other jurisdictions apply, Ardeno Group will seek to process personal information in accordance with applicable principles of lawfulness, transparency, data minimization, security, and respect for user rights.",
      ],
    },
    {
      id: "childrens-privacy",
      heading: "Children’s Privacy",
      paragraphs: [
        `The Ardeno Group website is not directed to minors, and Ardeno Group does not knowingly collect personal information from children. If a parent, guardian, or legal representative believes that a minor has provided personal information to Ardeno Group, they may contact ${CONTACT_EMAIL} to request deletion.`,
      ],
    },
    {
      id: "changes-to-this-privacy-policy",
      heading: "Changes to This Privacy Policy",
      paragraphs: [
        "Ardeno Group may update this Privacy Policy from time to time to reflect legal, operational, technological, or business changes. The most current version will be available on the website and will indicate the date of the latest update.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [
        "For questions regarding this Privacy Policy or the processing of personal information, users may contact:",
      ],
      contact: [
        {
          label: "Email",
          value: CONTACT_EMAIL,
          href: `mailto:${CONTACT_EMAIL}`,
        },
        {
          label: "Website",
          value: COMPANY_WEBSITE_LABEL,
          href: COMPANY_WEBSITE,
        },
      ],
    },
  ],
};
