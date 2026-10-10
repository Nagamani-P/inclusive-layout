/**
 * Three original e-commerce mock screens for a fictional store called "Basketly".
 * They copy common shopping patterns, not any real brand, and each one hides
 * realistic inclusion issues for reviewers to find.
 */

const W = 390;
const H = 844;
const FONT = "font-family='Arial, Helvetica, sans-serif'";

const frame = (body: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' ${FONT}>
  <rect width='${W}' height='${H}' fill='#FFFFFF'/>
  <g font-size='12' fill='#111'>
    <text x='22' y='22' font-weight='700'>9:41</text>
    <rect x='330' y='11' width='24' height='12' rx='3' fill='none' stroke='#111'/>
    <rect x='332' y='13' width='17' height='8' rx='1.5' fill='#111'/>
  </g>
  ${body}
</svg>`;

const bottomNav = `
  <rect x='0' y='780' width='${W}' height='64' fill='#FFFFFF'/>
  <line x1='0' y1='780' x2='${W}' y2='780' stroke='#E6E6E6'/>
  <g font-size='10' text-anchor='middle' fill='#8C8C8C'>
    <circle cx='39' cy='800' r='8' fill='#5B3FD6'/><text x='39' y='824' fill='#5B3FD6'>Home</text>
    <circle cx='117' cy='800' r='8' fill='#C9C9C9'/><text x='117' y='824'>Categories</text>
    <circle cx='195' cy='800' r='8' fill='#C9C9C9'/><text x='195' y='824'>Offers</text>
    <circle cx='273' cy='800' r='8' fill='#C9C9C9'/><text x='273' y='824'>Account</text>
    <circle cx='351' cy='800' r='8' fill='#C9C9C9'/><text x='351' y='824'>Cart</text>
  </g>`;

function productCard(x: number, y: number, name: string, price: string, mrp: string, shape: string, inStock: boolean) {
  return `
  <g transform='translate(${x} ${y})'>
    <rect width='167' height='232' rx='10' fill='#FFFFFF' stroke='#ECECEC'/>
    <rect x='10' y='10' width='147' height='120' rx='8' fill='#F4F1FB'/>
    ${shape}
    <circle cx='143' cy='22' r='7' fill='#FFFFFF' stroke='#9A9A9A'/>
    <path d='M139.5 21 q1.8-3 3.5 0 q1.7-3 3.5 0 q0 2.5-3.5 5 q-3.5-2.5-3.5-5z' fill='none' stroke='#9A9A9A' stroke-width='1'/>
    <text x='12' y='152' font-size='13' fill='#222'>${name}</text>
    <text x='12' y='176' font-size='15' font-weight='700' fill='#A9A9A9'>${price}</text>
    <text x='78' y='176' font-size='11' fill='#C4C4C4' text-decoration='line-through'>${mrp}</text>
    <circle cx='18' cy='198' r='5' fill='${inStock ? '#2E9E4F' : '#D93025'}'/>
    <rect x='12' y='208' width='72' height='16' rx='3' fill='#FFF4D6'/>
    <text x='16' y='220' font-size='9' fill='#E0A100'>Free delivery</text>
  </g>`;
}

export const SAMPLE_HOME = frame(`
  <rect x='0' y='34' width='${W}' height='96' fill='#5B3FD6'/>
  <text x='20' y='70' font-size='22' font-weight='700' fill='#FFFFFF'>Basketly</text>
  <circle cx='358' cy='62' r='9' fill='none' stroke='#FFFFFF' stroke-width='2'/>
  <text x='320' y='68' font-size='10' fill='#C9BEF5'>Login</text>
  <rect x='16' y='86' width='358' height='34' rx='8' fill='#FFFFFF'/>
  <text x='44' y='108' font-size='13' fill='#BDBDBD'>Search for products, brands and more</text>
  <circle cx='29' cy='103' r='6' fill='none' stroke='#BDBDBD' stroke-width='1.6'/>

  <rect x='16' y='144' width='358' height='120' rx='14' fill='#FFD54F'/>
  <text x='32' y='184' font-size='22' font-weight='700' fill='#FFFFFF'>Festive Sale</text>
  <text x='32' y='210' font-size='14' fill='#FFFFFF'>Up to 60% off on fashion</text>
  <rect x='32' y='224' width='86' height='26' rx='13' fill='#FFFFFF'/>
  <text x='46' y='241' font-size='12' font-weight='700' fill='#E0A100'>Shop now</text>
  <circle cx='318' cy='204' r='40' fill='#FFE082'/>
  <rect x='298' y='180' width='40' height='48' rx='6' fill='#FFB300'/>

  <g font-size='10' text-anchor='middle' fill='#555'>
    <circle cx='46' cy='300' r='22' fill='#EDE7FF'/><text x='46' y='338'>Mobiles</text>
    <circle cx='120' cy='300' r='22' fill='#E3F6EC'/><text x='120' y='338'>Fashion</text>
    <circle cx='194' cy='300' r='22' fill='#FFF0E3'/><text x='194' y='338'>Home</text>
    <circle cx='268' cy='300' r='22' fill='#E6F1FF'/><text x='268' y='338'>Beauty</text>
    <circle cx='342' cy='300' r='22' fill='#FFE8EE'/><text x='342' y='338'>Grocery</text>
  </g>

  <text x='16' y='378' font-size='17' font-weight='700' fill='#222'>Deals for you</text>
  <text x='318' y='378' font-size='12' fill='#7C68E0'>View all</text>
  ${productCard(16, 392, 'Wireless earbuds', '₹1,299', '₹3,999', "<rect x='58' y='42' width='22' height='40' rx='11' fill='#5B3FD6'/><rect x='88' y='42' width='22' height='40' rx='11' fill='#5B3FD6'/>", true)}
  ${productCard(207, 392, 'Cotton kurta', '₹699', '₹1,499', "<path d='M60 40 h48 l14 18 l-10 8 v50 h-56 v-50 l-10-8z' fill='#E8735A'/>", false)}
  <g transform='translate(0 0)'>
    <rect x='16' y='636' width='358' height='132' rx='10' fill='#F7F7F7'/>
    <text x='30' y='664' font-size='14' font-weight='700' fill='#222'>Order update</text>
    <text x='30' y='688' font-size='12' fill='#999'>Your parcel is out for delivery.</text>
    <text x='30' y='706' font-size='12' fill='#999'>Turn on sound to hear when it arrives.</text>
    <rect x='30' y='722' width='96' height='30' rx='6' fill='#D93025'/>
    <text x='46' y='742' font-size='12' fill='#FFFFFF'>Track order</text>
    <rect x='136' y='722' width='96' height='30' rx='6' fill='#2E9E4F'/>
    <text x='152' y='742' font-size='12' fill='#FFFFFF'>Rate seller</text>
  </g>
  ${bottomNav}
`);

export const SAMPLE_PRODUCT = frame(`
  <rect x='0' y='34' width='${W}' height='50' fill='#FFFFFF'/>
  <path d='M24 59 l8-8 M24 59 l8 8' stroke='#333' stroke-width='2' fill='none'/>
  <rect x='274' y='46' width='90' height='26' rx='13' fill='#FF7A1A'/>
  <text x='292' y='63' font-size='12' font-weight='700' fill='#FFFFFF'>Buy now</text>

  <rect x='0' y='84' width='${W}' height='300' fill='#F4F1FB'/>
  <path d='M90 290 q20-70 90-80 l60-40 q20 10 30 40 q30 30 40 60 q6 22-20 26 h-190 q-14-2-10-6z' fill='#5B3FD6'/>
  <path d='M100 300 h218' stroke='#FFFFFF' stroke-width='10'/>
  <g fill='#C7BBF3'><circle cx='175' cy='364' r='4'/><circle cx='189' cy='364' r='4' fill='#5B3FD6'/><circle cx='203' cy='364' r='4'/><circle cx='217' cy='364' r='4'/></g>

  <text x='20' y='416' font-size='18' font-weight='700' fill='#222'>Runner Pro sneakers</text>
  <text x='20' y='438' font-size='12' fill='#9A9A9A'>Lightweight mesh, men's running shoes</text>
  <rect x='20' y='450' width='46' height='20' rx='4' fill='#2E9E4F'/>
  <text x='28' y='464' font-size='12' font-weight='700' fill='#FFFFFF'>4.3</text>
  <text x='74' y='464' font-size='11' fill='#B0B0B0'>2,184 ratings</text>

  <text x='20' y='502' font-size='22' font-weight='700' fill='#222'>₹2,499</text>
  <text x='112' y='502' font-size='13' fill='#BDBDBD' text-decoration='line-through'>₹5,999</text>
  <text x='170' y='502' font-size='13' font-weight='700' fill='#2E9E4F'>58% off</text>

  <text x='20' y='536' font-size='13' font-weight='700' fill='#222'>Size (UK)</text>
  <g font-size='12' text-anchor='middle'>
    <rect x='20' y='546' width='28' height='28' rx='4' fill='#FFFFFF' stroke='#DDDDDD'/><text x='34' y='565' fill='#D93025'>6</text>
    <rect x='56' y='546' width='28' height='28' rx='4' fill='#FFFFFF' stroke='#DDDDDD'/><text x='70' y='565' fill='#333'>7</text>
    <rect x='92' y='546' width='28' height='28' rx='4' fill='#FFFFFF' stroke='#2E9E4F' stroke-width='2'/><text x='106' y='565' fill='#333'>8</text>
    <rect x='128' y='546' width='28' height='28' rx='4' fill='#FFFFFF' stroke='#DDDDDD'/><text x='142' y='565' fill='#333'>9</text>
    <rect x='164' y='546' width='28' height='28' rx='4' fill='#FFFFFF' stroke='#DDDDDD'/><text x='178' y='565' fill='#D93025'>10</text>
  </g>
  <text x='206' y='565' font-size='11' fill='#7C68E0'>Size chart</text>

  <text x='20' y='608' font-size='13' font-weight='700' fill='#222'>Delivery</text>
  <rect x='20' y='618' width='240' height='38' rx='6' fill='#FFFFFF' stroke='#E3E3E3'/>
  <text x='32' y='642' font-size='13' fill='#C2C2C2'>Enter PIN code</text>
  <text x='272' y='642' font-size='13' font-weight='700' fill='#7C68E0'>Check</text>
  <circle cx='26' cy='676' r='4' fill='#2E9E4F'/>
  <text x='36' y='680' font-size='12' fill='#2E9E4F'>Delivery by Tue, 14 Oct</text>
  <circle cx='26' cy='698' r='4' fill='#D93025'/>
  <text x='36' y='702' font-size='12' fill='#D93025'>Cash on delivery</text>

  <rect x='0' y='724' width='${W}' height='56' fill='#FFF8EC'/>
  <text x='20' y='748' font-size='12' font-weight='700' fill='#E0A100'>Bank offer</text>
  <text x='20' y='766' font-size='11' fill='#E8B84A'>10% instant discount with select cards</text>

  <rect x='0' y='780' width='${W}' height='64' fill='#FFFFFF'/>
  <line x1='0' y1='780' x2='${W}' y2='780' stroke='#E6E6E6'/>
  <text x='20' y='806' font-size='11' fill='#9A9A9A'>Total</text>
  <text x='20' y='826' font-size='16' font-weight='700' fill='#222'>₹2,499</text>
  <text x='282' y='818' font-size='13' fill='#7C68E0'>Add to cart</text>
`);

export const SAMPLE_CHECKOUT = frame(`
  <rect x='0' y='34' width='${W}' height='50' fill='#5B3FD6'/>
  <path d='M24 59 l8-8 M24 59 l8 8' stroke='#FFFFFF' stroke-width='2' fill='none'/>
  <text x='48' y='65' font-size='17' font-weight='700' fill='#FFFFFF'>Checkout</text>

  <g>
    <circle cx='70' cy='112' r='9' fill='#2E9E4F'/>
    <line x1='79' y1='112' x2='186' y2='112' stroke='#2E9E4F' stroke-width='3'/>
    <circle cx='195' cy='112' r='9' fill='#2E9E4F'/>
    <line x1='204' y1='112' x2='311' y2='112' stroke='#DDDDDD' stroke-width='3'/>
    <circle cx='320' cy='112' r='9' fill='#DDDDDD'/>
  </g>

  <text x='20' y='160' font-size='16' font-weight='700' fill='#222'>Delivery address</text>
  <rect x='20' y='174' width='350' height='44' rx='6' fill='#FFFFFF' stroke='#E3E3E3'/>
  <text x='34' y='201' font-size='14' fill='#C2C2C2'>Full name</text>
  <rect x='20' y='228' width='350' height='44' rx='6' fill='#FFFFFF' stroke='#E3E3E3'/>
  <text x='34' y='255' font-size='14' fill='#C2C2C2'>Mobile number</text>
  <rect x='20' y='282' width='170' height='44' rx='6' fill='#FFFFFF' stroke='#D93025' stroke-width='1.5'/>
  <text x='34' y='309' font-size='14' fill='#333'>6410</text>
  <text x='20' y='342' font-size='11' fill='#D93025'>Invalid</text>
  <rect x='200' y='282' width='170' height='44' rx='6' fill='#FFFFFF' stroke='#E3E3E3'/>
  <text x='214' y='309' font-size='14' fill='#C2C2C2'>City</text>

  <text x='20' y='384' font-size='16' font-weight='700' fill='#222'>Payment</text>
  <g font-size='13' fill='#333'>
    <circle cx='28' cy='410' r='6' fill='none' stroke='#5B3FD6' stroke-width='1.5'/><circle cx='28' cy='410' r='3' fill='#5B3FD6'/><text x='42' y='415'>UPI</text>
    <circle cx='28' cy='438' r='6' fill='none' stroke='#BDBDBD' stroke-width='1.5'/><text x='42' y='443'>Credit or debit card</text>
    <circle cx='28' cy='466' r='6' fill='none' stroke='#BDBDBD' stroke-width='1.5'/><text x='42' y='471'>Cash on delivery</text>
  </g>

  <rect x='20' y='494' width='350' height='120' rx='10' fill='#222'/>
  <circle cx='195' cy='548' r='22' fill='#FFFFFF' fill-opacity='0.9'/>
  <path d='M188 536 l20 12 l-20 12z' fill='#222'/>
  <text x='34' y='600' font-size='12' fill='#FFFFFF'>How to pay with UPI (2:10)</text>

  <rect x='20' y='628' width='350' height='54' rx='8' fill='#F3F0FF'/>
  <text x='34' y='651' font-size='12' fill='#7C68E0'>A chime will play when your order</text>
  <text x='34' y='667' font-size='12' fill='#7C68E0'>is confirmed. Keep your volume on.</text>

  <rect x='0' y='700' width='${W}' height='144' fill='#FFFFFF'/>
  <line x1='0' y1='700' x2='${W}' y2='700' stroke='#E6E6E6'/>
  <text x='20' y='728' font-size='13' fill='#9A9A9A'>Order total</text>
  <text x='300' y='728' font-size='15' font-weight='700' fill='#222'>₹2,499</text>
  <rect x='20' y='750' width='254' height='50' rx='8' fill='#8BD3A7'/>
  <text x='147' y='781' font-size='16' font-weight='700' fill='#FFFFFF' text-anchor='middle'>Place order</text>
  <rect x='282' y='750' width='88' height='50' rx='8' fill='#FFFFFF' stroke='#E3E3E3'/>
  <text x='326' y='781' font-size='13' fill='#D93025' text-anchor='middle'>Cancel</text>
`);

export const SAMPLES = [
  { name: 'Basketly home', svg: SAMPLE_HOME },
  { name: 'Basketly product page', svg: SAMPLE_PRODUCT },
  { name: 'Basketly checkout', svg: SAMPLE_CHECKOUT },
];
