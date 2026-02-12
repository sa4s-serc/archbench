import React from "react";
import TopBar from "../components/TopBar";

const Contribute = () => {
    return (
        <>
            <TopBar title="Contribute" subtitle="Submit your results to ArchBench" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div className="rounded-2xl bg-base-200/50 border border-base-300/50 p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-3">Contributing to ArchBench</h1>
                        <p className="text-sm leading-relaxed text-base-content/80">ArchBench is a benchmark for evaluating Large Language Models on Software Architecture tasks. We welcome contributions in various forms to help improve and expand the benchmark.</p>
                    </div>

                    <div className="rounded-xl bg-base-200/30 border border-base-300/30 p-6">
                        <h2 className="text-xl font-bold mb-3">Ways to Contribute</h2>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2"><span className="text-primary">•</span><span><strong>Submit Results:</strong> Run evaluations on new models and submit your results to the leaderboard.</span></li>
                            <li className="flex gap-2"><span className="text-primary">•</span><span><strong>Improve Datasets:</strong> Help curate and expand the benchmark datasets.</span></li>
                            <li className="flex gap-2"><span className="text-primary">•</span><span><strong>Code Contributions:</strong> Enhance the evaluation framework, add new tasks, or improve the website.</span></li>
                            <li className="flex gap-2"><span className="text-primary">•</span><span><strong>Report Issues:</strong> Found a bug or have suggestions? Open an issue on GitHub.</span></li>
                            <li className="flex gap-2"><span className="text-primary">•</span><span><strong>Documentation:</strong> Help improve documentation and tutorials.</span></li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-base-200/30 border border-base-300/30 p-6">
                        <h2 className="text-xl font-bold mb-3">Submitting Results</h2>
                        <p className="text-sm mb-3 text-base-content/80">To submit your model's results to the ArchBench leaderboard:</p>
                        <ol className="space-y-2 text-sm list-decimal list-inside">
                            <li>Use the <a href="https://github.com/sa4s-serc/archbench-cli" className="link link-primary">ArchBench CLI</a> to run evaluations on your model.</li>
                            <li>Follow the submission guidelines in the CLI repository.</li>
                            <li>Create a pull request to the <a href="https://github.com/sa4s-serc/archbench-results" className="link link-primary">archbench-results</a> repository with your predictions and trajectories.</li>
                        </ol>
                    </div>

                    <div className="rounded-xl bg-base-200/30 border border-base-300/30 p-6">
                        <h2 className="text-xl font-bold mb-3">Contributing Code</h2>
                        <p className="text-sm mb-3 text-base-content/80">If you'd like to contribute code:</p>
                        <ol className="space-y-2 text-sm list-decimal list-inside">
                            <li>Fork the relevant repository:
                                <ul className="mt-2 ml-6 space-y-1 list-disc list-inside">
                                    <li><a href="https://github.com/sa4s-serc/archbench-cli" className="link link-primary">ArchBench CLI</a> - For the evaluation framework and CLI tool</li>
                                    <li><a href="https://github.com/sa4s-serc/archbench" className="link link-primary">ArchBench Website</a> - For this website and leaderboard interface</li>
                                </ul>
                            </li>
                            <li>Create a feature branch for your changes.</li>
                            <li>Make your changes and ensure tests pass.</li>
                            <li>Submit a pull request with a clear description of your changes.</li>
                        </ol>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Contribute;
