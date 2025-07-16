import "mocha/mocha.js";
import { getMochaConfig } from "@webwriter/build/test";
import { assert } from "chai";
import "../src";
import { AutomatonComponent } from "../src";

mocha.setup(getMochaConfig());

describe("Simulation Tests", () => {
	let automaton: AutomatonComponent | null;

	const createConfiguredDFA = async () => {
		const element = document.createElement("webwriter-automaton");
		document.body.appendChild(element);

		// Configure the DFA
		element.setAttribute("type", "dfa");
		element.setAttribute(
			"nodes",
			JSON.stringify([
				{
					id: "1d027ee9-10a5-44ed-82db-56f75f27c817",
					label: "q1",
					x: -300,
					y: 0,
					initial: true,
				},
				{
					id: "f9445c8a-b577-4da1-9efc-f8dc0723e2b2",
					label: "q2",
					x: -100,
					y: 0,
				},
				{
					id: "df4d3c23-c3b7-4ad4-ae76-ad457ec6dd88",
					label: "q3",
					x: -300,
					y: 200,
					final: true,
				},
				{
					id: "eb3e35cd-b6be-4287-ab23-b31dad121d15",
					label: "q4",
					x: -100,
					y: 200,
					final: true,
				},
			])
		);
		element.setAttribute(
			"transitions",
			JSON.stringify([
				{
					id: "a7eefd06-1404-46c4-98c5-b534da394897",
					from: "1d027ee9-10a5-44ed-82db-56f75f27c817",
					to: "f9445c8a-b577-4da1-9efc-f8dc0723e2b2",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "468211a6-2801-40c9-a5b8-44f5ce67856e",
					from: "f9445c8a-b577-4da1-9efc-f8dc0723e2b2",
					to: "eb3e35cd-b6be-4287-ab23-b31dad121d15",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "33b325d1-c428-4ad1-89b6-b5c7a2039b36",
					from: "eb3e35cd-b6be-4287-ab23-b31dad121d15",
					to: "df4d3c23-c3b7-4ad4-ae76-ad457ec6dd88",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "e46e61d0-365a-473f-805a-70c4bf2a725d",
					from: "f9445c8a-b577-4da1-9efc-f8dc0723e2b2",
					to: "df4d3c23-c3b7-4ad4-ae76-ad457ec6dd88",
					symbols: ["b"],
					label: "b",
				},
				{
					id: "3ffed4af-a4b6-4028-ae27-5061fc470b01",
					from: "df4d3c23-c3b7-4ad4-ae76-ad457ec6dd88",
					to: "1d027ee9-10a5-44ed-82db-56f75f27c817",
					symbols: ["a", "b"],
					label: "a, b",
				},
				{
					id: "f9d7c091-53cd-4080-8fec-3ff6506e565a",
					from: "eb3e35cd-b6be-4287-ab23-b31dad121d15",
					to: "eb3e35cd-b6be-4287-ab23-b31dad121d15",
					symbols: ["b"],
					label: "b",
					selfReference: { angle: 5.497787143782138 },
				},
				{
					id: "eadd57cc-8269-4a08-b6ca-ecf9a113ae91",
					from: "1d027ee9-10a5-44ed-82db-56f75f27c817",
					to: "1d027ee9-10a5-44ed-82db-56f75f27c817",
					symbols: ["b"],
					label: "b",
					selfReference: { angle: 1.5707963267948966 },
				},
			])
		);

		return element as AutomatonComponent;
	};

	const createConfiguredNFA = async () => {
		const element = document.createElement("webwriter-automaton");
		document.body.appendChild(element);

		// Configure the NFA
		element.setAttribute("type", "nfa");
		element.setAttribute(
			"nodes",
			JSON.stringify([
				{
					id: "1aaa26fe-e982-4d1b-ace9-043db9263431",
					label: "q1",
					x: 0,
					y: 0,
					initial: true,
				},
				{
					id: "2b54610b-9df4-441c-9c70-145e5f144abe",
					label: "q2",
					x: 170,
					y: 0,
					final: true,
				},
				{
					id: "a7110a7c-d889-40e1-8f9a-c5a499cc9e86",
					label: "q3",
					x: 0,
					y: -170,
				},
				{
					id: "7d7003af-8408-4ee2-8b9b-47497d17272c",
					label: "q4",
					x: 170,
					y: -170,
					initial: false,
				},
				{
					id: "b1eb5c5e-a8bc-47a0-8233-6e5fbe3417d7",
					label: "q5",
					x: 0,
					y: 170,
				},
				{
					id: "f4a7c667-6481-49c6-8910-0d04832ae534",
					label: "q6",
					x: 170,
					y: 170,
				},
			])
		);
		element.setAttribute(
			"transitions",
			JSON.stringify([
				{
					id: "f397674b-03aa-4326-ab7e-09cffb2063b3",
					from: "1aaa26fe-e982-4d1b-ace9-043db9263431",
					to: "2b54610b-9df4-441c-9c70-145e5f144abe",
					symbols: [""],
					label: "ε",
				},
				{
					id: "ae1e0a59-743e-4c86-a9a1-6e5e6d390c47",
					from: "2b54610b-9df4-441c-9c70-145e5f144abe",
					to: "2b54610b-9df4-441c-9c70-145e5f144abe",
					symbols: ["b"],
					label: "b",
				},
				{
					id: "ae3115ac-08b5-4061-b6b1-e3924bd92854",
					from: "1aaa26fe-e982-4d1b-ace9-043db9263431",
					to: "a7110a7c-d889-40e1-8f9a-c5a499cc9e86",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "f4c9e602-007f-4c64-81a6-6e627949b5b3",
					from: "a7110a7c-d889-40e1-8f9a-c5a499cc9e86",
					to: "7d7003af-8408-4ee2-8b9b-47497d17272c",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "7a5592d1-e34c-48c4-89c5-86e257fc1623",
					from: "7d7003af-8408-4ee2-8b9b-47497d17272c",
					to: "1aaa26fe-e982-4d1b-ace9-043db9263431",
					symbols: ["b"],
					label: "b",
				},
				{
					id: "8f203542-6a17-4991-a527-6db0b81a1548",
					from: "2b54610b-9df4-441c-9c70-145e5f144abe",
					to: "b1eb5c5e-a8bc-47a0-8233-6e5fbe3417d7",
					symbols: ["a"],
					label: "a",
				},
				{
					id: "77a58817-8beb-4011-a833-bd737e05aac5",
					from: "b1eb5c5e-a8bc-47a0-8233-6e5fbe3417d7",
					to: "f4a7c667-6481-49c6-8910-0d04832ae534",
					symbols: ["b"],
					label: "b",
				},
				{
					id: "30e025c7-03cf-44c9-805d-f11ad0d3eca8",
					from: "f4a7c667-6481-49c6-8910-0d04832ae534",
					to: "2b54610b-9df4-441c-9c70-145e5f144abe",
					symbols: ["a"],
					label: "a",
				},
			])
		);

		return element as AutomatonComponent;
	};

	const createConfiguredPDA = async () => {
		const element = document.createElement("webwriter-automaton");
		document.body.appendChild(element);

		// Configure the PDA
		element.setAttribute("type", "pda");
		element.setAttribute(
			"nodes",
			JSON.stringify([
				{
					id: "999c24f4-8d13-4096-9523-0cd437283ae4",
					label: "q1",
					x: 0,
					y: 0,
					initial: true,
				},
				{
					id: "bb514fa6-ad1f-4b01-aad3-24ed0a02f25f",
					label: "q2",
					x: 200,
					y: 0,
				},
				{
					id: "7f1cc623-0392-47b3-b2e1-50fb0125e2e6",
					label: "q3",
					x: 200,
					y: 200,
				},
				{
					id: "9ce855f1-8cc7-4ed6-8d7e-b6ac4601080f",
					label: "q4",
					x: 0,
					y: 200,
					final: true,
				},
			])
		);
		element.setAttribute(
			"transitions",
			JSON.stringify([
				{
					id: "f3847e57-83ad-4d10-9dc0-ed609835d195",
					from: "999c24f4-8d13-4096-9523-0cd437283ae4",
					to: "bb514fa6-ad1f-4b01-aad3-24ed0a02f25f",
					symbols: [""],
					label: "ε,X|$X",
					stackOperations: [
						{ operation: "push", symbol: "$", condition: "" },
					],
				},
				{
					id: "38c138c6-12cf-4f22-9aed-7cb60d77ef28",
					from: "bb514fa6-ad1f-4b01-aad3-24ed0a02f25f",
					to: "bb514fa6-ad1f-4b01-aad3-24ed0a02f25f",
					symbols: ["0", "1"],
					label: "0,X|0X\n1,X|1X",
					stackOperations: [
						{ operation: "push", symbol: "0" },
						{ operation: "push", symbol: "1" },
					],
				},
				{
					id: "23e0ad59-29a0-4f90-bb6f-d61937eedd9e",
					from: "bb514fa6-ad1f-4b01-aad3-24ed0a02f25f",
					to: "7f1cc623-0392-47b3-b2e1-50fb0125e2e6",
					symbols: [""],
					label: "ε,X|X",
					stackOperations: [{ operation: "none", symbol: "" }],
				},
				{
					id: "7cb6d54e-84e1-4ace-8e66-8effba1e10a3",
					from: "7f1cc623-0392-47b3-b2e1-50fb0125e2e6",
					to: "7f1cc623-0392-47b3-b2e1-50fb0125e2e6",
					symbols: ["0", "1"],
					label: "0,0|ε\n1,1|ε",
					stackOperations: [
						{ operation: "pop", symbol: "0" },
						{ operation: "pop", symbol: "1" },
					],
					selfReference: { angle: 5.497787143782138 },
				},
				{
					id: "fd883ac9-4700-4e27-a1db-3827eef76b3f",
					from: "7f1cc623-0392-47b3-b2e1-50fb0125e2e6",
					to: "9ce855f1-8cc7-4ed6-8d7e-b6ac4601080f",
					symbols: [""],
					label: "ε,$|ε",
					stackOperations: [{ operation: "pop", symbol: "$" }],
				},
			])
		);

		return element as AutomatonComponent;
	};

	// Clean up after each test
	afterEach(() => {
		// Remove all automaton elements
		document
			.querySelectorAll("webwriter-automaton")
			.forEach((el) => el.remove());
	});

	describe("Component Initialization", () => {
		it("should initialize the automaton component", async () => {
			const automaton = await createConfiguredDFA();
			assert.isNotNull(automaton, "Automaton component should exist");
			assert.equal(
				automaton.getAttribute("type"),
				"dfa",
				"Should be configured as DFA"
			);
		});
	});

	describe("DFA Configuration", () => {
		it("should load and configure the test DFA", async () => {
			const automaton = await createConfiguredDFA();

			// Verify nodes are set
			const nodes = JSON.parse(automaton.getAttribute("nodes") || "[]");
			assert.equal(nodes.length, 4, "Should have 4 nodes");

			// Verify transitions are set
			const transitions = JSON.parse(
				automaton.getAttribute("transitions") || "[]"
			);
			assert.equal(transitions.length, 7, "Should have 7 transitions");

			// Verify initial state exists
			const initialNode = nodes.find((n) => n.initial);
			assert.isNotNull(initialNode, "Should have an initial state");

			// Verify final states exist
			const finalNodes = nodes.filter((n) => n.final);
			assert.equal(finalNodes.length, 2, "Should have 2 final states");
		});
	});

	describe("NFA Configuration", () => {
		it("should load and configure the test NFA", async () => {
			const automaton = await createConfiguredNFA();

			// Verify nodes are set
			const nodes = JSON.parse(automaton.getAttribute("nodes") || "[]");
			assert.equal(nodes.length, 6, "Should have 6 nodes");

			// Verify transitions are set
			const transitions = JSON.parse(
				automaton.getAttribute("transitions") || "[]"
			);
			assert.equal(transitions.length, 8, "Should have 8 transitions");

			// Verify initial state exists
			const initialNode = nodes.find((n) => n.initial);
			assert.isNotNull(initialNode, "Should have an initial state");

			// Verify final state exists
			const finalNodes = nodes.filter((n) => n.final);
			assert.equal(finalNodes.length, 1, "Should have 1 final state");
		});
	});

    describe("PDA Configuration", () => {
        it("should load and configure the test PDA", async () => {
            const automaton = await createConfiguredPDA();

            // Verify nodes are set
            const nodes = JSON.parse(automaton.getAttribute("nodes") || "[]");
            assert.equal(nodes.length, 4, "Should have 4 nodes");

            // Verify transitions are set
            const transitions = JSON.parse(
                automaton.getAttribute("transitions") || "[]"
            );
            assert.equal(transitions.length, 5, "Should have 5 transitions");

            // Verify initial state exists
            const initialNode = nodes.find((n) => n.initial);
            assert.isNotNull(initialNode, "Should have an initial state");

            // Verify final state exists
            const finalNodes = nodes.filter((n) => n.final);
            assert.equal(finalNodes.length, 1, "Should have 1 final state");
        });
    });

	describe("DFA Simulation", () => {
		beforeEach(async () => {
			automaton = await createConfiguredDFA();
		});

		const testCases = [
			{
				word: "aa",
				expected: "accepted",
				description: "should accept 'aa'",
			},
			{
				word: "ababab",
				expected: "accepted",
				description: "should accept 'ababab'",
			},
			{
				word: "a",
				expected: "rejected",
				description: "should reject 'a'",
			},
			{
				word: "aba",
				expected: "rejected",
				description: "should reject 'aba'",
			},
		];

		testCases.forEach(({ word, expected, description }) => {
			it(description, () => {
				automaton!.automaton.simulator.word = word;

				const result = automaton!.automaton.simulator.simulate();

				assert.equal(
					result!.status,
					expected,
					`Word '${word}' should be ${expected}`
				);
				assert.equal(
					result!.simulationResult?.accepted,
					expected === "accepted",
					`Word '${word}' should be ${expected}`
				);
				assert.isNotOk(
					result!.simulationResult?.errors,
					`Word '${word}' should be ${expected} without errors`
				);
			});
		});
	});

	describe("NFA Simulation", () => {
		beforeEach(async () => {
			automaton = await createConfiguredNFA();
		});

		const testCases = [
			{
				word: "",
				expected: "accepted",
				description: "should accept ''",
			},
			{
				word: "aabb",
				expected: "accepted",
				description: "should accept 'aabb'",
			},
			{
				word: "a",
				expected: "no_path",
				description: "should reject 'a'",
			},
			{
				word: "ba",
				expected: "no_path",
				description: "should reject 'ba'",
			},
		];

		testCases.forEach(({ word, expected, description }) => {
			it(description, () => {
				automaton!.automaton.simulator.word = word;

				const result = automaton!.automaton.simulator.simulate();

				assert.equal(
					result!.status,
					expected,
					`Word '${word}' should be ${expected}`
				);
				assert.equal(
					result!.simulationResult?.accepted,
					expected === "accepted",
					`Word '${word}' should be ${expected}`
				);
				assert.isNotOk(
					result!.simulationResult?.errors,
					`Word '${word}' should be ${expected} without errors`
				);
			});
		});
	});

    describe("PDA Simulation", () => {
        beforeEach(async () => {
            automaton = await createConfiguredPDA();
        });

        const testCases = [
            {
                word: "",
                expected: "accepted",
                description: "should accept ''",
            },
            {
                word: "0110",
                expected: "accepted",
                description: "should accept '0110'",
            },
            {
                word: "01",
                expected: "no_path",
                description: "should reject '01'",
            },
            {
                word: "1100",
                expected: "no_path",
                description: "should reject '1100'",
            },
        ];

        testCases.forEach(({ word, expected, description }) => {
            it(description, () => {
                automaton!.automaton.simulator.word = word;

                const result = automaton!.automaton.simulator.simulate();

                assert.equal(
                    result!.status,
                    expected,
                    `Word '${word}' should be ${expected}`
                );
                assert.equal(
                    result!.simulationResult?.accepted,
                    expected === "accepted",
                    `Word '${word}' should be ${expected}`
                );
                assert.isNotOk(
                    result!.simulationResult?.errors,
                    `Word '${word}' should be ${expected} without errors`
                );
            });
        });
    });
});

mocha.run();
