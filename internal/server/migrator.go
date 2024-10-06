package server

import (
	"context"

	"go.flipt.io/flipt/rpc/flipt"
	empty "google.golang.org/protobuf/types/known/emptypb"
)

func (s *Server) DeleteAllContents(ctx context.Context, req *flipt.DeleteAllContentsRequest) (*empty.Empty, error) {
	s.logger.Debug("delete all contents")
	err := s.store.DeleteAllContents(ctx)
	if err != nil {
		return nil, err
	}
	return &empty.Empty{}, nil
}
