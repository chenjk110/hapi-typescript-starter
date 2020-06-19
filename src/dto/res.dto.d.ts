declare namespace DTOs {
    interface IResBase {
        code: number
        msg: string
    }

    interface IResData<D = any> extends IResBase {
        data: D
    }

    interface IResPagination extends IResData {
        pageCounts: number
        pageIndex: number
        pageSize: number
    }
}