import { AutomatonComponent } from '../';
import { Node, StackOperation, Transition } from '../automata';

export function checkIfNodesUpdated(value: Node[], oldValue: Node[]) {
    if (!oldValue) return true;
    if (!value) return true;

    if (value.length !== oldValue.length) {
        return true;
    }

    for (let i = 0; i < value.length; i++) {
        if (hasNodeChanged(value[i], oldValue[i])) {
            return true;
        }
    }
    // console.log('checkIfNodesUpdated', value, oldValue);
    return false;
}

export function checkIfTransitionsUpdated(value: Transition[], oldValue: Transition[]) {
    if (!oldValue) return true;
    if (!value) return true;

    if (value.length !== oldValue.length) {
        return true;
    }

    for (let i = 0; i < value.length; i++) {
        if (hasTransitionChanged(value[i], oldValue[i])) {
            return true;
        }
    }
    // console.log('checkIfTransitionsUpdated', value, oldValue);
    return false;
}

export function stripNode(node: Node): Node {
    return {
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        initial: node.initial,
        final: node.final,
    };
}

export function stripTransition(transition: any) {
    AutomatonComponent.log('stripTransition', transition);

    return {
        id: transition.id,
        from: transition.from,
        to: transition.to,
        symbols: transition.symbols,
        label: transition.label,
        smooth: transition.smooth,
        stackOperations: transition.stackOperations,
    };
}

export function hasNodeChanged(newData: Node, oldData: Node) {
    return (
        newData.id !== oldData.id ||
        newData.label !== oldData.label ||
        newData.x !== oldData.x ||
        newData.y !== oldData.y ||
        newData.initial !== oldData.initial ||
        newData.final !== oldData.final
    );
}

export function hasTransitionChanged(newData: Transition, oldData: Transition) {
    AutomatonComponent.log('hasTransitionChanged', newData, oldData);

    return (
        newData.id !== oldData.id ||
        newData.from !== oldData.from ||
        newData.to !== oldData.to ||
        newData.label !== oldData.label ||
        didSymbolsChange(newData.symbols, oldData.symbols) ||
        newData.smooth !== oldData.smooth ||
        didStackOperationsChange(
            newData.stackOperations as StackOperation[],
            oldData.stackOperations as StackOperation[]
        )
    );
}

function didSymbolsChange(newSymbols: string[], oldSymbols: string[]) {
    newSymbols = new Array(...newSymbols);
    oldSymbols = new Array(...oldSymbols);
    return newSymbols.sort().join(',') !== oldSymbols.sort().join(',');
}

function didStackOperationsChange(newOperations: StackOperation[], oldOperations: StackOperation[]) {
    if (!newOperations && !oldOperations) return false;
    if (!newOperations || !oldOperations) return true;
    if (newOperations.length !== oldOperations.length) return true;

    for (let i = 0; i < newOperations.length; i++) {
        if (
            newOperations[i].operation !== oldOperations[i].operation ||
            newOperations[i].symbol !== oldOperations[i].symbol
        ) {
            return true;
        }
    }

    return false;
}
