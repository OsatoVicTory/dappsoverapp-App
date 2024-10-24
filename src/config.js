export const contractAddress = "0x9e33ad7b1be31e5f11c27858d4ad9baaecc30287";

export const FRONTEND_URL = 'https://dappsoverapp.netlify.app';

const image = 'https://lh3.googleusercontent.com/hr_crs_themes/ACP_IjEUeuVRrv9YzvMNWfi_5eVIwIJHWGAGR2jjgDC3juf5l3TuJeX2uKzkr04C9kNmYKa0vi0F0YK-O461DUrhEp1m0-s-KMQPzaQNRS0cuI53c6N-8nhnL04=s1280';

export const classRoomData = {
    // src: "https://",
    niche: 'Frontend Development', img_url: image,
    name: "Young X Developers", creator: 'Mr Dappsoverapss',
    announcement: 'New Material uploaded', createdAt: String(new Date()),
    description: `Learning how to export data in react js for frontend codes with export like export const contractAddress = 0x9e33ad7b1be31e5f11c2 7858d4ad9baaecc30287 haljb ADJHJAD H D dbhdf sfhghsfg sjdfg  jfhgufhg u fg`.repeat(2)
};

export const materialsData = Array(30).fill(0).map((val, id) => ({
    title: 'Animations and Transitions with cool CSS tricks',
    createdAt: String(new Date()), edited: String(new Date()),
    pTag: 'FairFun.Meme - No PVP', id,
    img_url: 'https://test.fairfun.meme/public/banner.png',
    url: 'https://test.fairfun.meme', 
    description: 'The fairest way to launch a memecoin with 0 liquidity seeding. Refund if not launched. No PVP',
    content: ['Concepts:\nAnimation is a great way to highlight interactive elements and add interest and fun to your designs.', 
        'In CSS, you can make this type of animation using CSS animations, which allow you to set an animation sequence, using ',
        'keyframes. Explain what you understand by Keyframe. Explain the animation properties in CSS.\n \n',
        'Coding:\nFrom the cross code pen we have been working with, create a slide-out animation', 
        'for the two elements cross-body and cross-tail after 10 seconds'
    ].join('')
}));