import { useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Clock, Share2, ShieldCheck, Zap, LogIn } from 'lucide-react'

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-secondary-900 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/50 to-secondary-900" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-200 to-white">
                            Project Management, <br />
                            Scientific & Precise.
                        </h1>
                        <p className="text-xl text-secondary-300 mb-10 leading-relaxed">
                            Master your project timelines with advanced PERT & CPM analysis.
                            Identify critical paths, optimize schedules, and deliver on time, every time.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-secondary-900 bg-white hover:bg-secondary-50 transition-all duration-200 shadow-lg shadow-white/10"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white border border-secondary-700 hover:bg-secondary-800 transition-all duration-200"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Log In
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-secondary-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-semibold text-primary-600 uppercase tracking-wide">Powerful Capabilities</h2>
                        <p className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl">
                            Everything you need to manage complexity.
                        </p>
                        <p className="mt-4 text-lg text-secondary-600">
                            Stop guessing. Start calculating. Our engine handles the mathematical heavy lifting for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Clock className="h-6 w-6 text-primary-600" />}
                            title="PERT Analysis"
                            description="Calculate realistic project durations using probabilistic time estimates (Optimistic, Most Likely, Pessimistic)."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-primary-600" />}
                            title="CPM Critical Path"
                            description="Instantly identify the critical path to know exactly which tasks determine your project's finish date."
                        />
                        <FeatureCard
                            icon={<Zap className="h-6 w-6 text-primary-600" />}
                            title="Crashing Analysis"
                            description="Optimize cost vs. time. Find the most cost-effective way to compress your project schedule."
                        />
                        <FeatureCard
                            icon={<Share2 className="h-6 w-6 text-primary-600" />}
                            title="Network Diagrams"
                            description="Visualize task dependencies with an interactive, auto-generated network graph."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-primary-600" />}
                            title="Risk Assessment"
                            description="Calculate the probability of meeting specific deadlines based on standard deviation and Z-scores."
                        />
                        <FeatureCard
                            icon={<ArrowRight className="h-6 w-6 text-primary-600" />}
                            title="Instant Export"
                            description="Export your analysis and diagrams to share with stakeholders and team members."
                        />
                    </div>
                </div>
            </div>

            {/* Stats/Social Proof (Visual Filler) */}
            <div className="bg-white py-24 border-t border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-secondary-900 mb-2">99.9%</div>
                            <div className="text-sm text-secondary-500 font-medium uppercase">Calculation Accuracy</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-secondary-900 mb-2">CPM/PERT</div>
                            <div className="text-sm text-secondary-500 font-medium uppercase">Methodologies Supported</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-secondary-900 mb-2">Instant</div>
                            <div className="text-sm text-secondary-500 font-medium uppercase">Network Rendering</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-secondary-900 mb-2">Free</div>
                            <div className="text-sm text-secondary-500 font-medium uppercase">Open Source</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-secondary-900 py-12 text-secondary-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-xl font-bold text-white tracking-tight">ProjectPath</span>
                        <p className="text-sm mt-2">© 2024 ProjectPath. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-secondary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group">
            <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">{title}</h3>
            <p className="text-secondary-600 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    )
}
