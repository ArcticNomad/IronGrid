export default function WhyUs() {
  return (
    <div className=" py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h1 className="mx-auto mt-2 max-w-lg text-center text-9xl font-bold tracking-tight text-balance text-white sm:text-5xl">
          WHY <span className="text-red-400">CHOOSE US </span>
        </h1>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2">
            <div className="absolute w-full inset-py bg- border-4 rounded-l-[2rem]"></div>

            <div className="relative flex h-full flex-col overflow-hidden ">
              <div className="pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-2xl font-bold tracking-tight text-white max-lg:text-center flex justify-center">
                  Tailored Workouts
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-center font-semibold text-gray-400 max-lg:text-center mb-2">
                  No matter if your'e just starting or a seasoned pro, our programs are designed to match your fitness
                </p>
              </div>
              <div className="@container relative min-h-[32 rem] w-full grow max-lg:mx-auto max-lg:max-w-sm">
              <div className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/grid1.jpg')" }}></div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-py rounded-lg shadow-sm "></div>
          </div>
          <div className="relative max-lg:row-start-1" >
            <div className=" rounded-xl bg- border-4 max-lg:rounded-t-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden ">
              <div className="mt-4 mb-2">
                <p className="text-2xl font-bold flex justify-center tracking-tight text-white max-lg:text-center">Equipment</p>
                <p className=" max-w-lg text-sm/6 text-center font-semibold text-gray-400 max-lg:text-center">
                  Train with the best and the latest and tested Equipment, guranteed to maximize your gains
                </p>
              </div>
              <div className="inset-0 w-full h-full overflow-hidden bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/grid2.jpg')" }}></div>
            </div>
            <div className="pointer-events-none absolute inset-py rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className=" inset-py rounded-xl bg- border-4 "></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className=" ">
                <p className="mt-2 text-2xl font-bold flex justify-center tracking-tight text-white max-lg:text-center">Membership</p>
                <p className="mt-2 max-w-lg text-sm/6 font-semibold text-center text-gray-400 max-lg:text-center">
                  Choose from flexible membership options to achieve you fitness goals on a budget 
                </p>
              </div>
           <div className="inset-0 w-full h-full bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/grid3.jpg')" }}></div>
            </div>
            <div className="pointer-events-none absolute inset-py rounded-lg shadow-sm ring-1 ring-black/5"></div>
          </div>
          <div className="relative lg:row-span-2">
            <div className=" inset-py rounded-xl bg- border-4 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="mt-2">
                <p className="mt-2 text-2xl font-bold flex justify-center tracking-tight text-white max-lg:text-center">
                  Trainers
                </p>
                <p className="mt-2 max-w-lg font-semibold text-sm/6 text-center text-gray-400 max-lg:text-center">
                  Our certified trainers guied you through every step of your journey, offering personalized coaching and motivation 
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow">
                <div className="absolute top-10 right-0 bottom-0 left-0 overflow-hidden  bg-gray-900 shadow-2xl">
                    <div className="inset-0 w-full h-full bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/grid4.jpg')" }}></div>
                  <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                    <div className="-mb-px flex text-sm/6 font-medium text-gray-400">                
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-14">{/* Your code example */}</div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-py rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
