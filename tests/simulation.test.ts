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
			"#0(-300|0);1(-100|0);%2(-300|200);%3(-100|200)"
		);
		element.setAttribute(
			"transitions",
			"0-1[a];1-3[a];3-2[a];1-2[b];2-0[a,b];3-3[b]@135;0-0[b]@0"
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
			"#0(0|0);%1(170|0);2(0|-170);3(170|-170);4(0|170);5(170|170)"
		);
		element.setAttribute(
			"transitions",
			"0-1[];1-1[b];0-2[a];2-3[a];3-0[b];1-4[a];4-5[b];5-1[a]"
		);

		return element as AutomatonComponent;
	};

	const createConfiguredPDA = async () => {
		const element = document.createElement("webwriter-automaton");
		document.body.appendChild(element);

		// Configure the PDA
		element.setAttribute("type", "pda");
		element.setAttribute("nodes", "#0(0|0);1(200|0);2(200|200);%3(0|200)");
		element.setAttribute(
			"transitions",
			"0-1[{p|%24|}];1-1[0{p|0|},1{p|1|}];1-2[{n||}];2-2[0{o|0|},1{o|1|}]@135;2-3[{o|%24|}]"
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
			const nodes = automaton.nodes;
			assert.equal(nodes.length, 4, "Should have 4 nodes");

			// Verify transitions are set
			const transitions = automaton.transitions;
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
			const nodes = automaton.nodes;
			assert.equal(nodes.length, 6, "Should have 6 nodes");

			// Verify transitions are set
			const transitions = automaton.transitions;
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
			const nodes = automaton.nodes;
			assert.equal(nodes.length, 4, "Should have 4 nodes");

			// Verify transitions are set
			const transitions = automaton.transitions;
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
