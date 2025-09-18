import { create } from "zustand";
import { IUser } from '@/modules/user';
import { getUserData } from "../token/user.storage";
import { IPrivilege } from "@/modules/privilege";
import permission from "./permission";

interface State {
    error: any;
    currentUser: IUser | null;
    permissions: IPrivilege[];
    loading: boolean;
    isAdmin: boolean
}

interface Actions {
    fetchFromLocalStorage: () => Promise<void>;
    checkPermission: (permissions: any[], action: string) => any;
}

const initialState: State = {
    currentUser: null,
    permissions: [],
    loading: false,
    error: null,
    isAdmin: false
};
const adminPermissions = [permission.user.getAll, permission.role.getAll, permission.privilege.getAll,
 permission.subscription.getAll,permission.event.getAll,permission.contact.getAll,permission.subscriptionPackage.getAll
];

const checkIsUserAdmin = (privileges: any[]) => {
    const listPer = adminPermissions.filter(action => {
        const privilege = privileges?.find(privilege => privilege.action === action);
        return privilege !== undefined;
    });
    // Exclude Subscription-GetAll
    return listPer.filter((l) => l != 'Subscription-GetAll').length > 0
}

export const usePermissionStore = create<State & Actions>((set) => ({
    ...initialState,
    fetchFromLocalStorage: async () => {
        set({ loading: true });
        try {
            const user = getUserData();
            if (user) {
                const privileges = user.roles[0].privileges
                const admin = checkIsUserAdmin(privileges as any)
                set({ currentUser: user, isAdmin: user.roles[0].roleName=='Admin', permissions: privileges, loading: false });
            } else {
                set({ loading: false });
            }
        } catch (error) {
            set({ error, loading: false });
        }
    },
    checkPermission: (privileges: any[], action: string) => {
        return privileges.some(privilege => privilege.action === action);
    },
}));
