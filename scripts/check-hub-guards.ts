import assert from 'node:assert/strict';

import { buildCityHubCopy, buildCityHubFacts } from '../lib/city-hub';
import { groupClinicChains } from '../lib/chains';
import { factualDescriptionText, unsupportedClaims } from '../lib/factual-description';

const botoxOnly = [{ name: 'Botox', slug: 'botox' }];

const guarded = factualDescriptionText({
  html: '<p>The clinic is in Cheras. It offers Pico laser. Botox is listed for this clinic. HydraFacial is available.</p>',
  services: botoxOnly,
  name: 'Example Clinic',
  area: 'Cheras',
  state: 'Kuala Lumpur',
});

assert.match(guarded, /Cheras/);
assert.match(guarded, /Botox/);
assert.doesNotMatch(guarded, /Pico|HydraFacial|laser/i);
assert.deepEqual(unsupportedClaims('Pico laser and Botox', botoxOnly), ['laser treatment']);

const empty = factualDescriptionText({
  html: '<p>We offer a wide range of laser treatments.</p>',
  services: [],
  name: 'Quiet Clinic',
  area: 'Ipoh',
  state: 'Perak',
});
assert.match(empty, /does not have services recorded/);
assert.doesNotMatch(empty, /laser/i);

const chains = groupClinicChains([
  { name: 'Dr Chong Clinic Cheras', slug: 'dr-chong-cheras', areaName: 'Cheras', stateName: 'Kuala Lumpur' },
  { name: 'Dr Chong Clinic Ipoh', slug: 'dr-chong-ipoh', areaName: 'Ipoh', stateName: 'Perak' },
  { name: 'Aglow Clinic Kuching', slug: 'aglow-kuching', areaName: 'Kuching', stateName: 'Sarawak' },
  { name: 'Lumi Clinic Cheras', slug: 'lumi-cheras', areaName: 'Cheras', stateName: 'Kuala Lumpur' },
  { name: 'Lumi Clinic Ipoh', slug: 'lumi-ipoh', areaName: 'Ipoh', stateName: 'Perak' },
  { name: 'Lumi Clinic Johor Bahru', slug: 'lumi-jb', areaName: 'Johor Bahru', stateName: 'Johor' },
  { name: 'Solo Aesthetic Studio', slug: 'solo', areaName: 'Bangsar', stateName: 'Kuala Lumpur' },
]);

assert.equal(chains.find((chain) => chain.slug === 'dr-chong-clinic')?.branches.length, 2);
assert.equal(chains.some((chain) => chain.slug === 'aglow-clinic'), false);
assert.equal(chains.find((chain) => chain.name === 'Lumi')?.branches.length, 3);

const idos = groupClinicChains([
  {
    name: "IDO'S Clinic - Cheras C180",
    slug: 'idos-cheras',
    areaName: 'Cheras',
    neighborhood: 'C180',
    stateName: 'Kuala Lumpur',
  },
  {
    name: "IDO'S Clinic - Sri Petaling",
    slug: 'idos-sp',
    areaName: 'Sri Petaling',
    stateName: 'Kuala Lumpur',
  },
  {
    name: "IDO'S Clinic - Sutera Utama",
    slug: 'idos-jb',
    areaName: 'Johor Bahru',
    neighborhood: 'Sutera Utama',
    stateName: 'Johor',
  },
]);
assert.equal(idos[0]?.name, "IDO'S");
assert.equal(idos[0]?.slug, 'idos');
assert.equal(idos[0]?.branches.length, 3);
assert.equal(chains.some((chain) => chain.branches.some((branch) => branch.slug === 'solo')), false);

const myclinic = groupClinicChains([
  { name: 'MyClinic Cheras', slug: 'myclinic-cheras', areaName: 'Cheras', stateName: 'Kuala Lumpur' },
  { name: 'My Clinic Ipoh', slug: 'my-clinic-ipoh', areaName: 'Ipoh', stateName: 'Perak' },
  { name: 'Not My Clinic Bangsar', slug: 'not-my-clinic', areaName: 'Bangsar', stateName: 'Kuala Lumpur' },
]);
assert.equal(myclinic.find((chain) => chain.slug === 'myclinic')?.branches.length, 2);
assert.equal(
  myclinic.some((chain) => chain.branches.some((branch) => branch.slug === 'not-my-clinic')),
  false,
);

const facts = buildCityHubFacts(
  [
    { name: 'Dr Ko Skin Specialist Cheras', slug: 'ko', neighborhood: 'Taman Midah', rating: 4.5 },
    { name: 'Nova Aesthetics', slug: 'nova', neighborhood: 'Taman Midah', rating: 4 },
  ],
  [
    { clinicSlug: 'ko', clinicName: 'Dr Ko Skin Specialist Cheras', serviceName: 'Acne', serviceSlug: 'acne' },
  ],
);
const copy = buildCityHubCopy({
  city: 'Cheras',
  state: 'Kuala Lumpur',
  facts,
  nearbyNames: ['Kajang'],
});

assert.equal(copy.title, '2 Aesthetic Clinics in Cheras, Kuala Lumpur');
const oneClinic = buildCityHubCopy({
  city: 'Sibu',
  state: 'Sarawak',
  facts: { ...facts, clinicCount: 1 },
  nearbyNames: [],
});
assert.equal(oneClinic.title, '1 Aesthetic Clinic in Sibu, Sarawak');
assert.match(copy.faqs.find((faq) => faq.question.includes('skin specialist'))?.answer ?? '', /Dr Ko/);
assert.match(copy.faqs.map((faq) => faq.answer).join(' '), /Acne \(1\)/);
assert.doesNotMatch(copy.intro, /best|trusted|top/i);

console.log('hub guards ok');
