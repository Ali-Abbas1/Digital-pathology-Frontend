'use client'

import dynamic from "next/dynamic";

const Image = dynamic(()=> import('@samvera/clover-iiif').then((clover)=> clover.Image),
{
  ssr: false,
},
);

export default function Home() {
  return (
    <div className="max-h-full h-full">
    <Image src='https://ids.lib.harvard.edu/ids/iiif/18772291/full/full/0/default.jpg' />
</div>
  );
}
